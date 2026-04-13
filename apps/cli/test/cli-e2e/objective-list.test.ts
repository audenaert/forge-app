// e2e for `etak objective list`. Mirrors idea-list.test.ts minus the
// --addresses filter (objective has no link fields).

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak objective list (built binary e2e)', () => {
  beforeAll(() => assertBuiltBin());

  const cleanups: Array<() => void> = [];
  let dir = '';
  beforeEach(() => {
    const { dir: d, cleanup } = makeTempProject();
    dir = d;
    cleanups.push(cleanup);
    runCli(['init'], { cwd: dir });
  });
  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('returns an empty array on a freshly initialized project', () => {
    const result = runCli(['objective', 'list'], { cwd: dir });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect((env.data as { items: unknown[] }).items).toEqual([]);
  });

  it('lists three objectives after create', () => {
    runCli(['objective', 'create', '--name', 'Alpha'], { cwd: dir });
    runCli(['objective', 'create', '--name', 'Beta', '--status', 'paused'], {
      cwd: dir,
    });
    runCli(['objective', 'create', '--name', 'Gamma'], { cwd: dir });

    const result = runCli(['objective', 'list'], { cwd: dir });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const items = (
      env.data as { items: Array<{ ref: { slug: string }; status: string }> }
    ).items;
    expect(items.map((i) => i.ref.slug).sort()).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('filters by --status', () => {
    runCli(['objective', 'create', '--name', 'Alpha'], { cwd: dir });
    runCli(['objective', 'create', '--name', 'Beta', '--status', 'paused'], {
      cwd: dir,
    });
    runCli(['objective', 'create', '--name', 'Gamma'], { cwd: dir });

    const result = runCli(['objective', 'list', '--status', 'paused'], {
      cwd: dir,
    });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const items = (env.data as { items: Array<{ ref: { slug: string } }> }).items;
    expect(items.map((i) => i.ref.slug)).toEqual(['beta']);
  });

  it('human --format=slugs prints one slug per line', () => {
    runCli(['objective', 'create', '--name', 'Alpha'], { cwd: dir });
    runCli(['objective', 'create', '--name', 'Beta'], { cwd: dir });

    const result = runCli(
      ['--output', 'human', 'objective', 'list', '--format', 'slugs'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('alpha');
    expect(result.stdout).toContain('beta');
  });

  it('human --format=table includes SLUG/STATUS/NAME columns', () => {
    runCli(['objective', 'create', '--name', 'Alpha'], { cwd: dir });
    const result = runCli(['--output', 'human', 'objective', 'list'], {
      cwd: dir,
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('SLUG');
    expect(result.stdout).toContain('STATUS');
    expect(result.stdout).toContain('NAME');
    expect(result.stdout).toContain('alpha');
  });

  it('rejects an invalid --format value with exit 1', () => {
    const result = runCli(['objective', 'list', '--format', 'yaml'], {
      cwd: dir,
    });
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
  });
});
