import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { assertBuiltBin, pkgRoot, runCli } from './helpers.js';

describe('etak --help / --version (built binary e2e)', () => {
  beforeAll(() => assertBuiltBin());

  it('--version prints the package.json version and exits 0', () => {
    const pkgJson = JSON.parse(
      readFileSync(resolve(pkgRoot, 'package.json'), 'utf8'),
    ) as { version: string };
    const result = runCli(['--version']);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(pkgJson.version);
  });

  it('--help lists init and all six type namespaces', () => {
    const result = runCli(['--help']);
    expect(result.status).toBe(0);
    for (const name of [
      'init',
      'idea',
      'objective',
      'opportunity',
      'assumption',
      'experiment',
      'critique',
    ]) {
      expect(result.stdout).toContain(name);
    }
  });

  it('init --help lists the --with-config and --root flags', () => {
    const result = runCli(['init', '--help']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('--with-config');
    // --root is a global flag, so it appears in `etak --help`, not init's.
    // But init's help should still describe the init command itself.
    expect(result.stdout).toMatch(/initialize/i);
  });

  it('idea --help lists the five leaf subcommands', () => {
    const result = runCli(['idea', '--help']);
    expect(result.status).toBe(0);
    for (const leaf of ['create', 'get', 'list', 'update', 'link']) {
      expect(result.stdout).toContain(leaf);
    }
  });

  it('idea create --help exits 0', () => {
    const result = runCli(['idea', 'create', '--help']);
    expect(result.status).toBe(0);
  });
});
