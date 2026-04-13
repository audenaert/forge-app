// e2e for `etak idea list`. Covers: empty listing, multi-item listing,
// status filter, addresses filter, slugs format.

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak idea list (built binary e2e)', () => {
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
    const result = runCli(['idea', 'list'], { cwd: dir });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect((env.data as { items: unknown[] }).items).toEqual([]);
  });

  it('lists three ideas after create', () => {
    runCli(['idea', 'create', '--name', 'Alpha'], { cwd: dir });
    runCli(['idea', 'create', '--name', 'Beta', '--status', 'exploring'], { cwd: dir });
    runCli(['idea', 'create', '--name', 'Gamma'], { cwd: dir });

    const result = runCli(['idea', 'list'], { cwd: dir });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const items = (env.data as { items: Array<{ ref: { slug: string }; status: string }> }).items;
    expect(items.map((i) => i.ref.slug).sort()).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('filters by --status', () => {
    runCli(['idea', 'create', '--name', 'Alpha'], { cwd: dir });
    runCli(['idea', 'create', '--name', 'Beta', '--status', 'exploring'], { cwd: dir });
    runCli(['idea', 'create', '--name', 'Gamma'], { cwd: dir });

    const result = runCli(['idea', 'list', '--status', 'exploring'], { cwd: dir });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const items = (env.data as { items: Array<{ ref: { slug: string } }> }).items;
    expect(items.map((i) => i.ref.slug)).toEqual(['beta']);
  });

  it('filters by --addresses', () => {
    runCli(['idea', 'create', '--name', 'Linked', '--addresses', 'target-opp'], {
      cwd: dir,
    });
    runCli(['idea', 'create', '--name', 'Unlinked'], { cwd: dir });

    const result = runCli(['idea', 'list', '--addresses', 'target-opp'], { cwd: dir });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const items = (env.data as { items: Array<{ ref: { slug: string } }> }).items;
    expect(items.map((i) => i.ref.slug)).toEqual(['linked']);
  });

  it('human --format=slugs prints one slug per line', () => {
    runCli(['idea', 'create', '--name', 'Alpha'], { cwd: dir });
    runCli(['idea', 'create', '--name', 'Beta'], { cwd: dir });

    const result = runCli(
      ['--output', 'human', 'idea', 'list', '--format', 'slugs'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('alpha');
    expect(result.stdout).toContain('beta');
  });

  it('human --format=table includes SLUG/STATUS/NAME columns', () => {
    runCli(['idea', 'create', '--name', 'Alpha'], { cwd: dir });
    const result = runCli(['--output', 'human', 'idea', 'list'], { cwd: dir });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('SLUG');
    expect(result.stdout).toContain('STATUS');
    expect(result.stdout).toContain('NAME');
    expect(result.stdout).toContain('alpha');
  });
});
