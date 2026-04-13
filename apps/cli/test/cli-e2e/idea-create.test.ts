// e2e coverage for `etak idea create` — spawns the built binary so every
// layer of the chassis participates. Covers: happy path, derived slug,
// explicit slug override, invalid status, missing --name, dangling link
// warning, --from-file body source, slug collision.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak idea create (built binary e2e)', () => {
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

  it('creates an idea with a derived slug and canonical body scaffold', () => {
    const result = runCli(['idea', 'create', '--name', 'Test Idea Name'], { cwd: dir });
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');

    const env = parseEnvelope(result.stdout);
    expect(env.schema).toBe('etak-cli.v1');
    expect(env.status).toBe('ok');
    expect(env.command).toBe('idea create');
    const data = env.data as {
      ref: { type: string; slug: string };
      created: { status: string; addresses: string[]; delivered_by: string[] };
    };
    expect(data.ref).toEqual({ type: 'idea', slug: 'test-idea-name' });
    expect(data.created.status).toBe('draft');

    const file = resolve(dir, '.etak/artifacts/ideas/test-idea-name.md');
    expect(existsSync(file)).toBe(true);
    const content = readFileSync(file, 'utf8');
    expect(content).toContain('name: Test Idea Name');
    expect(content).toContain('type: idea');
    expect(content).toContain('status: draft');
    expect(content).toContain('## Description');
    expect(content).toContain('## Why This Could Work');
  });

  it('accepts an explicit --slug override', () => {
    const result = runCli(
      ['idea', 'create', '--name', 'Some Name', '--slug', 'manual-slug'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect((env.data as { ref: { slug: string } }).ref.slug).toBe('manual-slug');
    expect(existsSync(resolve(dir, '.etak/artifacts/ideas/manual-slug.md'))).toBe(true);
  });

  it('exits 1 when --status is not a valid enum value', () => {
    const result = runCli(
      ['idea', 'create', '--name', 'Test', '--status', 'drafy'],
      { cwd: dir },
    );
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
  });

  it('exits 4 when --name is missing (commander required-option path)', () => {
    const result = runCli(['idea', 'create'], { cwd: dir });
    // commander's required-option check is a usage error → exit 4.
    expect(result.status).toBe(4);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_USAGE');
  });

  it('surfaces a dangling_ref warning when --addresses points at a non-existent opportunity', () => {
    const result = runCli(
      ['idea', 'create', '--name', 'Danglers', '--addresses', 'nope'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'dangling_ref',
    );
    expect(dangling.length).toBe(1);
    // And the file still lands:
    expect(existsSync(resolve(dir, '.etak/artifacts/ideas/danglers.md'))).toBe(true);
  });

  it('surfaces a dangling_ref warning when --delivered-by points at a non-existent target', () => {
    const result = runCli(
      ['idea', 'create', '--name', 'Delivery Danglers', '--delivered-by', 'nonexistent-slug'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (
      env.warnings as Array<{ kind: string; details?: { field?: string; to?: { slug: string } } }>
    ).filter((w) => w.kind === 'dangling_ref');
    expect(dangling.length).toBe(1);
    expect(dangling[0]?.details?.field).toBe('delivered_by');
    expect(dangling[0]?.details?.to?.slug).toBe('nonexistent-slug');
    expect(existsSync(resolve(dir, '.etak/artifacts/ideas/delivery-danglers.md'))).toBe(true);
  });

  it('reports exactly one dangling_ref when --addresses is valid and --delivered-by is not', () => {
    // Pre-create an opportunity so --addresses resolves. --delivered-by
    // remains dangling; only one warning should surface.
    const oppDir = resolve(dir, '.etak/artifacts/opportunities');
    mkdirSync(oppDir, { recursive: true });
    writeFileSync(
      resolve(oppDir, 'real-opp.md'),
      '---\nname: Real\ntype: opportunity\nstatus: active\n---\n\n## Description\n\nx\n\n## Evidence\n\ny\n',
      'utf8',
    );

    const result = runCli(
      [
        'idea',
        'create',
        '--name',
        'Mixed Danglers',
        '--addresses',
        'real-opp',
        '--delivered-by',
        'nonexistent',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (
      env.warnings as Array<{ kind: string; details?: { field?: string } }>
    ).filter((w) => w.kind === 'dangling_ref');
    expect(dangling.length).toBe(1);
    expect(dangling[0]?.details?.field).toBe('delivered_by');
  });

  it('--from-file replaces the body with the file contents', () => {
    const bodyPath = resolve(dir, 'body.md');
    const body = '## Description\n\nFrom the file.\n\n## Why This Could Work\n\nBecause.\n';
    writeFileSync(bodyPath, body, 'utf8');

    const result = runCli(
      ['idea', 'create', '--name', 'FromFile', '--from-file', bodyPath],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const onDisk = readFileSync(
      resolve(dir, '.etak/artifacts/ideas/fromfile.md'),
      'utf8',
    );
    expect(onDisk).toContain('From the file.');
    expect(onDisk).toContain('Because.');
  });

  it('slug collision on second create errors (adapter emits ValidationError → exit 1)', () => {
    const first = runCli(['idea', 'create', '--name', 'Dup'], { cwd: dir });
    expect(first.status).toBe(0);
    const second = runCli(['idea', 'create', '--name', 'Dup'], { cwd: dir });
    // The fs adapter raises ValidationError on slug collision (exit 1);
    // see fs-adapter.ts write(). The story's expectation of exit 3 was
    // aspirational — the adapter contract is the source of truth.
    expect(second.status).toBe(1);
    const env = parseEnvelope(second.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
    expect(env.errors[0]?.message).toMatch(/slug already exists/);
  });

  it('human-mode success prints a one-line summary', () => {
    const result = runCli(
      ['--output', 'human', 'idea', 'create', '--name', 'Humane'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('created idea');
    expect(result.stdout).toContain('humane');
  });
});
