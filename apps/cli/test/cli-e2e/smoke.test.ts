import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeAll } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, '..', '..');
const builtBin = resolve(pkgRoot, 'dist', 'cli.js');
const pkgJsonPath = resolve(pkgRoot, 'package.json');

function runCli(args: string[]) {
  return spawnSync(process.execPath, [builtBin, ...args], {
    encoding: 'utf8',
    cwd: pkgRoot,
  });
}

describe('etak cli (built binary smoke)', () => {
  beforeAll(() => {
    // The package-level `test` script runs `npm run build` before vitest, so
    // dist/ should exist. Fail loudly with an actionable message if it does
    // not — this is the only thing the scaffold story asserts at runtime.
    if (!existsSync(builtBin)) {
      throw new Error(
        `Expected built binary at ${builtBin}. Run \`npm run build\` in apps/cli first.`,
      );
    }
  });

  it('--version prints the package.json version', () => {
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as { version: string };
    const result = runCli(['--version']);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout.trim()).toBe(pkg.version);
  });

  it('--help lists all placeholder command namespaces', () => {
    const result = runCli(['--help']);

    expect(result.status).toBe(0);
    const out = result.stdout;
    for (const name of [
      'init',
      'idea',
      'objective',
      'opportunity',
      'assumption',
      'experiment',
      'critique',
    ]) {
      expect(out).toContain(name);
    }
  });

  it('invoking a placeholder command exits with code 4', () => {
    const result = runCli(['idea']);
    expect(result.status).toBe(4);
    expect(result.stderr).toContain('not implemented');
  });
});
