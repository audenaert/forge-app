// e2e for `etak opportunity list`. Covers empty, multiple, --status filter,
// and --supports filter.

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak opportunity list (built binary e2e)', () => {
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
    const result = runCli(['opportunity', 'list'], { cwd: dir });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect((env.data as { items: unknown[] }).items).toEqual([]);
  });

  it('lists multiple opportunities with name and status', () => {
    runCli(['opportunity', 'create', '--name', 'Alpha'], { cwd: dir });
    runCli(
      ['opportunity', 'create', '--name', 'Bravo', '--status', 'paused'],
      { cwd: dir },
    );
    const result = runCli(['opportunity', 'list'], { cwd: dir });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const items = (
      env.data as { items: Array<{ ref: { slug: string }; status: string }> }
    ).items;
    expect(items.length).toBe(2);
    const slugs = items.map((i) => i.ref.slug).sort();
    expect(slugs).toEqual(['alpha', 'bravo']);
  });

  it('filters by --status', () => {
    runCli(['opportunity', 'create', '--name', 'Alpha'], { cwd: dir });
    runCli(
      ['opportunity', 'create', '--name', 'Bravo', '--status', 'paused'],
      { cwd: dir },
    );
    const result = runCli(
      ['opportunity', 'list', '--status', 'paused'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const items = (env.data as { items: Array<{ status: string }> }).items;
    expect(items.length).toBe(1);
    expect(items[0]?.status).toBe('paused');
  });

  it('filters by --supports', () => {
    runCli(
      [
        'opportunity',
        'create',
        '--name',
        'Aligned',
        '--supports',
        'some-objective',
      ],
      { cwd: dir },
    );
    runCli(['opportunity', 'create', '--name', 'Unaligned'], { cwd: dir });
    const result = runCli(
      ['opportunity', 'list', '--supports', 'some-objective'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const items = (env.data as { items: Array<{ ref: { slug: string } }> })
      .items;
    expect(items.length).toBe(1);
    expect(items[0]?.ref.slug).toBe('aligned');
  });

  it('human table mode formats columns and headers', () => {
    runCli(['opportunity', 'create', '--name', 'One'], { cwd: dir });
    const result = runCli(
      ['--output', 'human', 'opportunity', 'list'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('SLUG');
    expect(result.stdout).toContain('STATUS');
    expect(result.stdout).toContain('NAME');
    expect(result.stdout).toContain('one');
  });

  it('human slugs mode prints one slug per line', () => {
    runCli(['opportunity', 'create', '--name', 'One'], { cwd: dir });
    runCli(['opportunity', 'create', '--name', 'Two'], { cwd: dir });
    const result = runCli(
      ['--output', 'human', 'opportunity', 'list', '--format', 'slugs'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const lines = result.stdout.trim().split('\n');
    expect(lines).toContain('one');
    expect(lines).toContain('two');
  });
});
