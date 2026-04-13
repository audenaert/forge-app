// Shared helpers for cli-e2e tests. All tests spawn the built binary so
// they exercise the same path as a real shell invocation.

import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const pkgRoot = resolve(here, '..', '..');
export const builtBin = resolve(pkgRoot, 'dist', 'cli.js');

export function assertBuiltBin(): void {
  if (!existsSync(builtBin)) {
    throw new Error(
      `Expected built binary at ${builtBin}. Run \`npm run build\` in apps/cli first.`,
    );
  }
}

export interface RunCliOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

export function runCli(
  args: readonly string[],
  opts: RunCliOptions = {},
): SpawnSyncReturns<string> {
  return spawnSync(process.execPath, [builtBin, ...args], {
    encoding: 'utf8',
    cwd: opts.cwd ?? pkgRoot,
    env: {
      // Disable color by default so assertions can match plain text. Tests
      // that specifically care about coloring override this.
      NO_COLOR: '1',
      // Isolate from the user's env. Tests that want env vars set them
      // explicitly via opts.env.
      PATH: process.env['PATH'] ?? '',
      HOME: process.env['HOME'] ?? '',
      ...opts.env,
    },
  });
}

/** Create an isolated tempdir and return a cleanup callback. */
export function makeTempProject(): { dir: string; cleanup: () => void } {
  const dir = mkdtempSync(resolve(tmpdir(), 'etak-e2e-'));
  const cleanup = (): void => {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* swallow; next test run will reclaim */
    }
  };
  return { dir, cleanup };
}

/** Parse the single-line JSON envelope emitted by the CLI. */
export function parseEnvelope(raw: string): {
  schema: string;
  command: string;
  status: 'success' | 'error';
  data: unknown;
  warnings: unknown[];
  errors: { code: string; message: string }[];
} {
  // The envelope is the last non-empty line (commander `--help` etc. might
  // precede on stdout, but for real commands there's only one line).
  const line = raw.trim();
  return JSON.parse(line);
}
