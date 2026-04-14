// e2e coverage for `etak critique create`. Exercises the body-as-opaque,
// statusless deviations directly: --status and --section are expected
// to be rejected as unknown options (exit 4).

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak critique create (built binary e2e)', () => {
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

  it('creates a critique with a derived slug and opaque body placeholder', () => {
    const result = runCli(
      ['critique', 'create', '--name', 'My Critique', '--target', 'some-idea'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect(env.status).toBe('ok');
    expect(env.command).toBe('critique create');
    const data = env.data as {
      ref: { type: string; slug: string };
      created: { name: string; target: string; date: string };
    };
    expect(data.ref).toEqual({ type: 'critique', slug: 'my-critique' });
    expect(data.created.target).toBe('some-idea');
    expect(data.created.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const file = resolve(dir, '.etak/artifacts/critiques/my-critique.md');
    expect(existsSync(file)).toBe(true);
    const content = readFileSync(file, 'utf8');
    expect(content).toContain('name: My Critique');
    expect(content).toContain('type: critique');
    expect(content).toContain('target: some-idea');
    expect(content).toContain('_TODO: write critique content_');
    // Opaque body: no canonical H2 headings. The placeholder is rendered
    // headless.
    expect(content).not.toMatch(/^## /m);
    // Statusless: the frontmatter must not emit a status key.
    expect(content).not.toContain('status:');
  });

  it('accepts an explicit --slug override', () => {
    const result = runCli(
      [
        'critique',
        'create',
        '--name',
        'Whatever',
        '--target',
        'idea',
        '--slug',
        'manual-critique',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    expect(
      existsSync(resolve(dir, '.etak/artifacts/critiques/manual-critique.md')),
    ).toBe(true);
  });

  it('captures repeated --personas-used / --frameworks-used / --artifacts-created', () => {
    const result = runCli(
      [
        'critique',
        'create',
        '--name',
        'Rich',
        '--target',
        'some-target',
        '--personas-used',
        'Skeptic',
        '--personas-used',
        'Coach',
        '--frameworks-used',
        'Pre-mortem',
        '--artifacts-created',
        'assumption-a',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const data = env.data as {
      created: {
        personas_used: string[];
        frameworks_used: string[];
        artifacts_created: string[];
      };
    };
    expect(data.created.personas_used).toEqual(['Skeptic', 'Coach']);
    expect(data.created.frameworks_used).toEqual(['Pre-mortem']);
    expect(data.created.artifacts_created).toEqual(['assumption-a']);
  });

  it('exits 4 when --name is missing (commander required-option path)', () => {
    const result = runCli(['critique', 'create', '--target', 'something'], {
      cwd: dir,
    });
    expect(result.status).toBe(4);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_USAGE');
  });

  it('exits 4 when --target is missing (commander required-option path)', () => {
    const result = runCli(['critique', 'create', '--name', 'No Target'], {
      cwd: dir,
    });
    expect(result.status).toBe(4);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_USAGE');
  });

  it('rejects --status as an unknown option (exit 4, canary for statusless)', () => {
    const result = runCli(
      [
        'critique',
        'create',
        '--name',
        'X',
        '--target',
        'y',
        '--status',
        'active',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(4);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_USAGE');
    expect(env.errors[0]?.message).toMatch(/unknown option.*--status/);
  });

  it('rejects --section as an unknown option (exit 4, canary for body-as-opaque)', () => {
    const result = runCli(
      [
        'critique',
        'create',
        '--name',
        'X',
        '--target',
        'y',
        '--section',
        'concerns=stuff',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(4);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_USAGE');
    expect(env.errors[0]?.message).toMatch(/unknown option.*--section/);
  });

  it('surfaces a dangling_ref warning when --target does not resolve', () => {
    const result = runCli(
      ['critique', 'create', '--name', 'Dang', '--target', 'nowhere'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (env.warnings as Array<{ kind: string; details?: { field?: string } }>)
      .filter((w) => w.kind === 'dangling_ref');
    expect(dangling.length).toBe(1);
    expect(dangling[0]?.details?.field).toBe('target');
  });

  it('does not dangle when --target resolves to an existing idea', () => {
    // Pre-create an idea so --target resolves.
    runCli(['idea', 'create', '--name', 'Real Target'], { cwd: dir });
    const result = runCli(
      ['critique', 'create', '--name', 'Clean', '--target', 'real-target'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'dangling_ref',
    );
    expect(dangling.length).toBe(0);
  });

  it('slug collision on second create errors (exit 1)', () => {
    const first = runCli(
      ['critique', 'create', '--name', 'Dup', '--target', 'some-target'],
      { cwd: dir },
    );
    expect(first.status).toBe(0);
    const second = runCli(
      ['critique', 'create', '--name', 'Dup', '--target', 'some-target'],
      { cwd: dir },
    );
    expect(second.status).toBe(1);
    const env = parseEnvelope(second.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
  });

  it('human-mode success prints a one-line summary', () => {
    const result = runCli(
      [
        '--output',
        'human',
        'critique',
        'create',
        '--name',
        'Humane',
        '--target',
        'some-target',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('created critique');
    expect(result.stdout).toContain('humane');
  });
});
