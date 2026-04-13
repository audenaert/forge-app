import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, afterEach, describe, expect, it } from 'vitest';
import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak init (built binary e2e)', () => {
  beforeAll(() => assertBuiltBin());

  const cleanups: Array<() => void> = [];
  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('creates the .etak/artifacts skeleton with per-type subdirs and gitkeep files', () => {
    const { dir, cleanup } = makeTempProject();
    cleanups.push(cleanup);

    const result = runCli(['init'], { cwd: dir });
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');

    const env = parseEnvelope(result.stdout);
    expect(env.status).toBe('success');
    expect(env.command).toBe('init');
    expect(env.schema).toBe('etak-cli/v1');

    for (const sub of [
      'objectives',
      'opportunities',
      'ideas',
      'assumptions',
      'experiments',
      'critiques',
    ]) {
      expect(existsSync(resolve(dir, '.etak/artifacts', sub))).toBe(true);
      expect(existsSync(resolve(dir, '.etak/artifacts', sub, '.gitkeep'))).toBe(true);
    }
  });

  it('is idempotent: a second init reports alreadyExisted and still exits 0', () => {
    const { dir, cleanup } = makeTempProject();
    cleanups.push(cleanup);

    const first = runCli(['init'], { cwd: dir });
    expect(first.status).toBe(0);

    const second = runCli(['init'], { cwd: dir });
    expect(second.status).toBe(0);
    const env = parseEnvelope(second.stdout);
    expect(env.status).toBe('success');
    const data = env.data as { created: string[]; alreadyExisted: string[] };
    expect(data.created.length).toBe(0);
    expect(data.alreadyExisted.length).toBeGreaterThan(0);
  });

  it('honors --root <path> to pick a target directory other than cwd', () => {
    const { dir, cleanup } = makeTempProject();
    cleanups.push(cleanup);

    // Run from a different cwd, pointing at the temp project.
    const result = runCli(['--root', dir, 'init']);
    expect(result.status).toBe(0);
    expect(existsSync(resolve(dir, '.etak/artifacts/ideas'))).toBe(true);
  });

  it('exits 1 when --root points at a nonexistent path', () => {
    const result = runCli(['--root', '/definitely/does/not/exist-xyz', 'init']);
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
  });

  it('writes a minimal etak.config.json only when --with-config is passed', () => {
    const { dir, cleanup } = makeTempProject();
    cleanups.push(cleanup);

    const without = runCli(['init'], { cwd: dir });
    expect(without.status).toBe(0);
    expect(existsSync(resolve(dir, '.etak/etak.config.json'))).toBe(false);

    const { dir: dir2, cleanup: cleanup2 } = makeTempProject();
    cleanups.push(cleanup2);
    const withCfg = runCli(['init', '--with-config'], { cwd: dir2 });
    expect(withCfg.status).toBe(0);
    const cfgPath = resolve(dir2, '.etak/etak.config.json');
    expect(existsSync(cfgPath)).toBe(true);
    const contents = JSON.parse(readFileSync(cfgPath, 'utf8')) as { schema: string };
    expect(contents.schema).toBe('etak/v1');
  });

  it('human-mode output prints a single summary line', () => {
    const { dir, cleanup } = makeTempProject();
    cleanups.push(cleanup);

    const result = runCli(['--output', 'human', 'init'], { cwd: dir });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('initialized etak project at');
    expect(result.stdout).toContain(dir);
  });
});
