// e2e coverage for `etak objective create` — spawns the built binary so
// every layer of the chassis participates. Mirrors idea-create.test.ts
// with objective-specific field set (no addresses, no delivered_by).

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  pkgRoot,
  runCli,
} from './helpers.js';

describe('etak objective create (built binary e2e)', () => {
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

  it('creates an objective with a derived slug and canonical body scaffold', () => {
    const result = runCli(['objective', 'create', '--name', 'Test Objective Name'], {
      cwd: dir,
    });
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');

    const env = parseEnvelope(result.stdout);
    expect(env.schema).toBe('etak-cli.v1');
    expect(env.status).toBe('ok');
    expect(env.command).toBe('objective create');
    const data = env.data as {
      ref: { type: string; slug: string };
      created: { status: string };
    };
    expect(data.ref).toEqual({ type: 'objective', slug: 'test-objective-name' });
    expect(data.created.status).toBe('active');

    const file = resolve(dir, '.etak/artifacts/objectives/test-objective-name.md');
    expect(existsSync(file)).toBe(true);
    const content = readFileSync(file, 'utf8');
    expect(content).toContain('name: Test Objective Name');
    expect(content).toContain('type: objective');
    expect(content).toContain('status: active');
    expect(content).toContain('## Description');
    expect(content).toContain('## Context');
    expect(content).toContain('## Success Criteria');
    expect(content).toContain('## Out of Scope');

    // Required: Description and Success Criteria carry the placeholder.
    // Optional: Context and Out of Scope do NOT.
    const descIdx = content.indexOf('## Description');
    const ctxIdx = content.indexOf('## Context');
    const sucIdx = content.indexOf('## Success Criteria');
    const oosIdx = content.indexOf('## Out of Scope');
    expect(content.slice(descIdx, ctxIdx)).toContain('_TODO: fill in_');
    expect(content.slice(sucIdx, oosIdx)).toContain('_TODO: fill in_');
    expect(content.slice(ctxIdx, sucIdx)).not.toContain('_TODO: fill in_');
    expect(content.slice(oosIdx)).not.toContain('_TODO: fill in_');
  });

  it('accepts an explicit --slug override', () => {
    const result = runCli(
      ['objective', 'create', '--name', 'Some Name', '--slug', 'manual-slug'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect((env.data as { ref: { slug: string } }).ref.slug).toBe('manual-slug');
    expect(
      existsSync(resolve(dir, '.etak/artifacts/objectives/manual-slug.md')),
    ).toBe(true);
  });

  it('accepts a non-default --status', () => {
    const result = runCli(
      ['objective', 'create', '--name', 'Paused One', '--status', 'paused'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect((env.data as { created: { status: string } }).created.status).toBe('paused');
  });

  it('exits 1 when --status is not a valid enum value', () => {
    const result = runCli(
      ['objective', 'create', '--name', 'Test', '--status', 'wat'],
      { cwd: dir },
    );
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
  });

  it('exits 4 when --name is missing (commander required-option path)', () => {
    const result = runCli(['objective', 'create'], { cwd: dir });
    expect(result.status).toBe(4);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_USAGE');
  });

  it('--from-file replaces the body with the file contents', () => {
    const bodyPath = resolve(dir, 'body.md');
    const body =
      '## Description\n\nFrom the file.\n\n## Success Criteria\n\nDone when X.\n';
    writeFileSync(bodyPath, body, 'utf8');

    const result = runCli(
      ['objective', 'create', '--name', 'FromFile', '--from-file', bodyPath],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const onDisk = readFileSync(
      resolve(dir, '.etak/artifacts/objectives/fromfile.md'),
      'utf8',
    );
    expect(onDisk).toContain('From the file.');
    expect(onDisk).toContain('Done when X.');
  });

  it('slug collision on second create errors (adapter emits ValidationError → exit 1)', () => {
    const first = runCli(['objective', 'create', '--name', 'Dup'], { cwd: dir });
    expect(first.status).toBe(0);
    const second = runCli(['objective', 'create', '--name', 'Dup'], { cwd: dir });
    expect(second.status).toBe(1);
    const env = parseEnvelope(second.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
    expect(env.errors[0]?.message).toMatch(/slug already exists/);
  });

  it('human-mode success prints a one-line summary', () => {
    const result = runCli(
      ['--output', 'human', 'objective', 'create', '--name', 'Humane'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('created objective');
    expect(result.stdout).toContain('humane');
  });

  it('real-fixture round-trip: dropping a known objective into the project reads back cleanly', () => {
    // Copy the live fixture into the temp project, verify get parses it
    // with the canonical section set and no missing-required warnings.
    // pkgRoot is apps/cli; fixture lives at <repo-root>/docs/discovery/...
    const fixture = readFileSync(
      resolve(
        pkgRoot,
        '..',
        '..',
        'docs',
        'discovery',
        'objectives',
        'grow-etak-via-local-first-plg.md',
      ),
      'utf8',
    );
    const target = resolve(
      dir,
      '.etak/artifacts/objectives/grow-etak-via-local-first-plg.md',
    );
    writeFileSync(target, fixture, 'utf8');

    const result = runCli(
      ['objective', 'get', 'grow-etak-via-local-first-plg'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const data = env.data as {
      document: {
        frontmatter: { name: string; status: string };
        body: { sections: Array<{ slug: string; status: string }> };
      };
    };
    expect(data.document.frontmatter.name).toContain('local-first');
    expect(data.document.frontmatter.status).toBe('active');
    const sectionSlugs = data.document.body.sections.map((s) => s.slug);
    expect(sectionSlugs).toContain('description');
    expect(sectionSlugs).toContain('context');
    expect(sectionSlugs).toContain('success_criteria');
    expect(sectionSlugs).toContain('out_of_scope');

    // No missing_required_section warnings on the fixture — it's the
    // ground-truth shape the template was calibrated against.
    const missing = (
      env.warnings as Array<{ kind: string }>
    ).filter((w) => w.kind === 'missing_required_section');
    expect(missing.length).toBe(0);
  });
});
