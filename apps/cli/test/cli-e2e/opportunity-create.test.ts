// e2e coverage for `etak opportunity create` — spawns the built binary.
// Mirrors idea-create with opportunity-specific field set (`supports`,
// `hmw`) and uses the live fixture for the round-trip assertion.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  pkgRoot,
  runCli,
} from './helpers.js';

describe('etak opportunity create (built binary e2e)', () => {
  beforeAll(() => assertBuiltBin());

  const cleanups: Array<() => void> = [];
  let dir = '';
  beforeEach(() => {
    const { dir: d, cleanup } = makeTempProject();
    dir = d;
    cleanups.push(cleanup);
    const init = runCli(['init'], { cwd: dir });
    expect(init.status).toBe(0);
  });
  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('creates an opportunity with derived slug and canonical body scaffold', () => {
    const result = runCli(
      ['opportunity', 'create', '--name', 'Test Opportunity Name'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');

    const env = parseEnvelope(result.stdout);
    expect(env.schema).toBe('etak-cli.v1');
    expect(env.status).toBe('ok');
    expect(env.command).toBe('opportunity create');
    const data = env.data as {
      ref: { type: string; slug: string };
      created: { status: string; supports: string[] };
    };
    expect(data.ref).toEqual({
      type: 'opportunity',
      slug: 'test-opportunity-name',
    });
    expect(data.created.status).toBe('active');
    expect(data.created.supports).toEqual([]);

    const file = resolve(
      dir,
      '.etak/artifacts/opportunities/test-opportunity-name.md',
    );
    expect(existsSync(file)).toBe(true);
    const content = readFileSync(file, 'utf8');
    expect(content).toContain('name: Test Opportunity Name');
    expect(content).toContain('type: opportunity');
    expect(content).toContain('status: active');
    expect(content).toContain('## Description');
    expect(content).toContain('## Evidence');
    expect(content).toContain('## Who Experiences This');

    // Required: Description and Evidence carry the placeholder.
    // Optional: Who Experiences This does NOT.
    const descIdx = content.indexOf('## Description');
    const evIdx = content.indexOf('## Evidence');
    const whoIdx = content.indexOf('## Who Experiences This');
    expect(content.slice(descIdx, evIdx)).toContain('_TODO: fill in_');
    expect(content.slice(evIdx, whoIdx)).toContain('_TODO: fill in_');
    expect(content.slice(whoIdx)).not.toContain('_TODO: fill in_');
  });

  it('accepts an explicit --slug override', () => {
    const result = runCli(
      ['opportunity', 'create', '--name', 'Some Name', '--slug', 'manual-opp'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect((env.data as { ref: { slug: string } }).ref.slug).toBe('manual-opp');
    expect(
      existsSync(resolve(dir, '.etak/artifacts/opportunities/manual-opp.md')),
    ).toBe(true);
  });

  it('accepts a non-default --status', () => {
    const result = runCli(
      ['opportunity', 'create', '--name', 'Paused Opp', '--status', 'paused'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect((env.data as { created: { status: string } }).created.status).toBe(
      'paused',
    );
  });

  it('exits 1 when --status is an invalid enum value', () => {
    const result = runCli(
      ['opportunity', 'create', '--name', 'Test', '--status', 'wat'],
      { cwd: dir },
    );
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
  });

  it('exits 4 when --name is missing (commander required-option path)', () => {
    const result = runCli(['opportunity', 'create'], { cwd: dir });
    expect(result.status).toBe(4);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_USAGE');
  });

  it('surfaces a dangling_ref warning when --supports points at a non-existent objective', () => {
    const result = runCli(
      ['opportunity', 'create', '--name', 'Dangler', '--supports', 'ghost-obj'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (
      env.warnings as Array<{ kind: string; details?: { field?: string } }>
    ).filter((w) => w.kind === 'dangling_ref');
    expect(dangling.length).toBe(1);
    expect(dangling[0]?.details?.field).toBe('supports');
    expect(
      existsSync(resolve(dir, '.etak/artifacts/opportunities/dangler.md')),
    ).toBe(true);
  });

  it('no dangling warning when --supports target already exists', () => {
    // Pre-create a real objective by hand-writing the file.
    const objDir = resolve(dir, '.etak/artifacts/objectives');
    mkdirSync(objDir, { recursive: true });
    writeFileSync(
      resolve(objDir, 'real-obj.md'),
      '---\nname: Real Obj\ntype: objective\nstatus: active\n---\n\n## Description\n\nd\n\n## Success Criteria\n\ns\n',
      'utf8',
    );

    const result = runCli(
      ['opportunity', 'create', '--name', 'NonDangler', '--supports', 'real-obj'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'dangling_ref',
    );
    expect(dangling.length).toBe(0);
  });

  it('persists --hmw into frontmatter', () => {
    const result = runCli(
      [
        'opportunity',
        'create',
        '--name',
        'With HMW',
        '--hmw',
        'HMW help solo devs onboard?',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const data = env.data as { created: { hmw?: string } };
    expect(data.created.hmw).toBe('HMW help solo devs onboard?');

    const onDisk = readFileSync(
      resolve(dir, '.etak/artifacts/opportunities/with-hmw.md'),
      'utf8',
    );
    expect(onDisk).toContain('hmw:');
    expect(onDisk).toContain('HMW help solo devs onboard?');
    // The `hmw` key is in the known-extras allowlist, so no
    // `unknown_frontmatter_field` warning should surface on read-back.
    const getResult = runCli(['opportunity', 'get', 'with-hmw'], { cwd: dir });
    expect(getResult.status).toBe(0);
    const getEnv = parseEnvelope(getResult.stdout);
    const unknown = (getEnv.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'unknown_frontmatter_field',
    );
    expect(unknown.length).toBe(0);
  });

  it('--from-file replaces the body with the file contents', () => {
    const bodyPath = resolve(dir, 'body.md');
    const body =
      '## Description\n\nFrom the file.\n\n## Evidence\n\nProof.\n';
    writeFileSync(bodyPath, body, 'utf8');

    const result = runCli(
      [
        'opportunity',
        'create',
        '--name',
        'FromFile',
        '--from-file',
        bodyPath,
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const onDisk = readFileSync(
      resolve(dir, '.etak/artifacts/opportunities/fromfile.md'),
      'utf8',
    );
    expect(onDisk).toContain('From the file.');
    expect(onDisk).toContain('Proof.');
  });

  it('slug collision on second create errors (adapter emits ValidationError → exit 1)', () => {
    const first = runCli(['opportunity', 'create', '--name', 'Dup'], { cwd: dir });
    expect(first.status).toBe(0);
    const second = runCli(['opportunity', 'create', '--name', 'Dup'], { cwd: dir });
    expect(second.status).toBe(1);
    const env = parseEnvelope(second.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
    expect(env.errors[0]?.message).toMatch(/slug already exists/);
  });

  it('human-mode success prints a one-line summary', () => {
    const result = runCli(
      ['--output', 'human', 'opportunity', 'create', '--name', 'Humane'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('created opportunity');
    expect(result.stdout).toContain('humane');
  });

  it('real-fixture round-trip: dropping the live opportunity reads back cleanly', () => {
    // Copy the live fixture into the temp project, verify `get` parses it
    // with the expected section set and surfaces no unknown-frontmatter or
    // missing-required warnings. The fixture carries an `hmw` field that
    // must also round-trip.
    const fixture = readFileSync(
      resolve(
        pkgRoot,
        '..',
        '..',
        'docs',
        'discovery',
        'opportunities',
        'solo-devs-blocked-by-team-tool-overhead.md',
      ),
      'utf8',
    );
    const target = resolve(
      dir,
      '.etak/artifacts/opportunities/solo-devs-blocked-by-team-tool-overhead.md',
    );
    writeFileSync(target, fixture, 'utf8');

    const result = runCli(
      ['opportunity', 'get', 'solo-devs-blocked-by-team-tool-overhead'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const data = env.data as {
      document: {
        frontmatter: { name: string; status: string; hmw?: unknown };
        body: { sections: Array<{ slug: string }> };
      };
    };
    expect(data.document.frontmatter.name).toContain('Solo developers');
    expect(data.document.frontmatter.status).toBe('active');
    expect(typeof data.document.frontmatter.hmw).toBe('string');
    expect(String(data.document.frontmatter.hmw)).toContain('HMW');

    const sectionSlugs = data.document.body.sections.map((s) => s.slug);
    expect(sectionSlugs).toContain('description');
    expect(sectionSlugs).toContain('evidence');
    expect(sectionSlugs).toContain('who_experiences_this');

    // No missing_required_section warnings on the fixture.
    const missing = (
      env.warnings as Array<{ kind: string }>
    ).filter((w) => w.kind === 'missing_required_section');
    expect(missing.length).toBe(0);
    // And `hmw` must not be flagged as an unknown extra — it's on the
    // allowlist.
    const unknown = (
      env.warnings as Array<{ kind: string }>
    ).filter((w) => w.kind === 'unknown_frontmatter_field');
    expect(unknown.length).toBe(0);
  });
});
