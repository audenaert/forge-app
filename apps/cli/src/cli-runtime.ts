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

// Why these peeks exist at all
// ---------------------------------------------------------------------------
// commander has a perfectly good `--output <mode>` option with
// `.choices(['json', 'human'])`. The tempting "simplification" is to use it
// and delete this module. DO NOT. Commander's `choices` validation routes
// bad values through `commander.invalidArgument`, which the chassis maps to
// exit 4 (usage error). Design spec §4 requires exit 1 (validation error)
// for bad `--output` values — it's user-correctable input, not a usage
// mistake like `etak frobnicate`. We peek argv ourselves, validate early,
// and surface a ValidationError through the chassis envelope so the exit
// code lines up with the spec's exit-code table (§4.3).
//
// The peek also has to run BEFORE commander parses so that commander-level
// errors (unknown command, unknown flag) can be rendered through the
// correct output mode — the user's `--output json` still needs to be
// honored when commander itself is what rejected the invocation.
//
// POSIX `--` end-of-options handling
// ---------------------------------------------------------------------------
// Both peeks stop scanning at a bare `--` token. After `--`, everything is
// a positional argument — even if it looks like a flag. M2+ commands that
// accept free-form trailing args (e.g. a description containing the
// literal text `--output`) must not have that misread as a mode switch.

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
    // POSIX end-of-options: stop scanning. Anything after `--` is a
    // positional, not a flag, regardless of how it looks.
    if (arg === '--') break;
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
 *
 * Returns `undefined` when the flag is absent OR when `--output`/`-o`
 * appears as the last token with no value following. The latter falls
 * back to the default mode rather than exploding; if the user meant to
 * pass a value and forgot it, they'll discover the miss on the next
 * invocation. This keeps the peek total — it never throws.
 */
export function peekRawOutput(argv: readonly string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    // POSIX end-of-options: everything after `--` is positional.
    if (arg === '--') return undefined;
    if (arg === '--output' || arg === '-o') {
      // `--output` with no value following: return undefined, not the
      // next undefined slot. Fall back to the default mode.
      return argv[i + 1];
    }
    if (arg?.startsWith('--output=')) {
      return arg.slice('--output='.length);
    }
  }
  return undefined;
}
