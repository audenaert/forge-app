// Chassis runtime helpers shared across the CLI entry point and the
// type-subcommand stubs.
//
// `ChassisGlobals` is the bag of process-level dependencies the commander
// layer needs: streams, env, cwd, and an `exit` function. Tests inject a
// fake to avoid spawning subprocesses for unit coverage of the boundary.
//
import type { OutputMode } from './output/tty.js';
import type { StreamPair } from './output/write.js';

export interface ChassisGlobals {
  readonly cwd: string;
  readonly env: NodeJS.ProcessEnv;
  readonly streams: StreamPair & { stdout: NodeJS.WriteStream; stderr: NodeJS.WriteStream };
  readonly mode: OutputMode;
  /**
   * Color override. `undefined` lets picocolors auto-detect (TTY + NO_COLOR).
   * Tests set `false` for deterministic snapshots.
   */
  readonly color?: boolean | undefined;
  /** Process exit — injectable for tests. */
  readonly exit: (code: number) => void;
}

/**
 * Read `--output` and `--color` from argv before commander parses, so the
 * chassis can pick the right renderer even for errors raised inside
 * commander itself (unknown command, unknown flag). Only well-formed
 * values are honored; unknown `--output` values fall through to the raw
 * peek (see `peekRawOutput`) which drives validation.
 */
export function peekGlobalFlags(argv: readonly string[]): {
  output?: 'human' | 'json' | undefined;
  color?: boolean | undefined;
} {
  const out: { output?: 'human' | 'json'; color?: boolean } = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--output' || arg === '-o') {
      const next = argv[i + 1];
      if (next === 'json' || next === 'human') out.output = next;
    } else if (arg?.startsWith('--output=')) {
      const val = arg.slice('--output='.length);
      if (val === 'json' || val === 'human') out.output = val;
    } else if (arg === '--no-color') {
      out.color = false;
    } else if (arg === '--color') {
      out.color = true;
    }
  }
  return out;
}

/**
 * Raw peek of `--output`: returns the exact string the user passed,
 * whatever it was. Used to validate the flag value up front and surface
 * a structured validation error (exit 1) on unknown values — the spec
 * only defines "human" and "json".
 */
export function peekRawOutput(argv: readonly string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--output' || arg === '-o') {
      return argv[i + 1];
    }
    if (arg?.startsWith('--output=')) {
      return arg.slice('--output='.length);
    }
  }
  return undefined;
}
