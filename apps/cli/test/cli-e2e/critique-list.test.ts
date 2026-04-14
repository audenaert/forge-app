// e2e coverage for `etak critique list`.

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak critique list (built binary e2e)', () => {
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

  it('returns an empty list on a fresh project', () => {
    const result = runCli(['critique', 'list'], { cwd: dir });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const data = env.data as { items: unknown[] };
    expect(data.items).toEqual([]);
  });

  it('lists multiple critiques', () => {
    runCli(['critique', 'create', '--name', 'Alpha Critique', '--target', 'one-target'], {
      cwd: dir,
    });
    runCli(['critique', 'create', '--name', 'Beta Critique', '--target', 'two-target'], {
      cwd: dir,
    });
    const result = runCli(['critique', 'list'], { cwd: dir });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const data = env.data as {
      items: Array<{ ref: { slug: string }; name: string; target: string; date: string }>;
    };
    expect(data.items).toHaveLength(2);
    expect(data.items.map((i) => i.ref.slug).sort()).toEqual([
      'alpha-critique',
      'beta-critique',
    ]);
    for (const item of data.items) {
      expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('filters by --target', () => {
    runCli(['critique', 'create', '--name', 'Alpha Critique', '--target', 'one-target'], {
      cwd: dir,
    });
    runCli(['critique', 'create', '--name', 'Beta Critique', '--target', 'two-target'], {
      cwd: dir,
    });
    const result = runCli(['critique', 'list', '--target', 'one-target'], {
      cwd: dir,
    });
    const env = parseEnvelope(result.stdout);
    const data = env.data as { items: Array<{ ref: { slug: string } }> };
    expect(data.items).toHaveLength(1);
    expect(data.items[0]?.ref.slug).toBe('alpha-critique');
  });

  it('rejects --status as an unknown option (exit 4, statusless canary)', () => {
    const result = runCli(['critique', 'list', '--status', 'active'], {
      cwd: dir,
    });
    expect(result.status).toBe(4);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_USAGE');
    expect(env.errors[0]?.message).toMatch(/unknown option.*--status/);
  });

  it('human-mode slugs format prints one per line', () => {
    runCli(['critique', 'create', '--name', 'Alpha Critique', '--target', 'some-target'], {
      cwd: dir,
    });
    runCli(['critique', 'create', '--name', 'Beta Critique', '--target', 'some-target'], {
      cwd: dir,
    });
    const result = runCli(
      ['--output', 'human', 'critique', 'list', '--format', 'slugs'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const lines = result.stdout.trim().split('\n');
    expect(lines.sort()).toEqual(['alpha-critique', 'beta-critique']);
  });
});
