// Top-level CLI entry point.
//
// Responsibilities, in order of execution:
//   1. Peek global flags from argv (needed to pick the renderer BEFORE
//      commander has run, so commander-level errors still route through
//      the envelope).
//   2. Read the package version for `--version`.
//   3. Build the commander program with:
//        - global flags (`--output`, `--root`, `--no-color`, `--version`),
//        - `etak init` (which skips context resolution — runs before
//          any adapter exists),
//        - one stub subcommand per artifact type (M1-S6 replaces the
//          `idea` group; M2 replaces the others).
//   4. Wire commander's exit-override so unknown commands, unknown flags,
//      and missing arguments route through the chassis envelope instead
//      of commander's default stderr output.
//   5. `process.exit(code)` with the mapped exit code from `runCommand`.
//
// Handlers must NEVER call `process.exit`; the chassis owns exit. The
// only exception is commander's own `exitOverride`, which throws a
// `CommanderError` we catch and convert here.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command, CommanderError } from 'commander';

import { ARTIFACT_TYPES } from './schemas/index.js';
import { envelopeError } from './output/envelope.js';
import { detectOutputMode, parseOutputMode, type OutputMode } from './output/tty.js';
import { writeResult, type StreamPair } from './output/write.js';
import { ValidationError } from './adapters/errors.js';
import { runCommand } from './errors/boundary.js';
import {
  EXIT_USAGE,
  EXIT_VALIDATION,
  UsageError,
  exitCodeFor,
} from './errors/exit-codes.js';
import {
  peekGlobalFlags,
  peekRawOutput,
  type ChassisGlobals,
} from './cli-runtime.js';
import { registerNotImplementedType } from './commands/not-implemented.js';
import { registerIdeaCommands } from './commands/idea/index.js';
import { registerObjectiveCommands } from './commands/objective/index.js';
import { registerOpportunityCommands } from './commands/opportunity/index.js';
import { initHumanSummary, runInit, type InitOptions } from './commands/init.js';

function readPackageVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const pkgPath = resolve(here, '..', 'package.json');
  const raw = readFileSync(pkgPath, 'utf8');
  const parsed = JSON.parse(raw) as { version?: string };
  return parsed.version ?? '0.0.0';
}

// ---------------------------------------------------------------------------
// Program construction
// ---------------------------------------------------------------------------

interface BuildProgramOptions {
  globals: ChassisGlobals;
  /**
   * Receives the final exit code from a resolved handler. The commander
   * action callbacks set this via closure so `main()` can read it after
   * `parseAsync` returns.
   */
  setExitCode: (code: number) => void;
}

function buildProgram(opts: BuildProgramOptions): Command {
  const program = new Command();
  const { globals, setExitCode } = opts;

  program
    .name('etak')
    .description('Etak CLI — local-first interface for discovery artifacts')
    .version(readPackageVersion(), '-v, --version', 'print the @etak/cli version')
    // Global flags. `--output`, `--no-color`, and `--root` are available on
    // every subcommand. `--root` is consumed only by `etak init` in M1-S5;
    // later stories may route it into the context builder.
    .option('-o, --output <mode>', 'output mode: json|human', 'auto')
    .option('--root <path>', 'project root override (used by `etak init`)')
    .option('--no-color', 'disable ANSI colors in human output')
    // commander's own error routing: throw so main() can catch and render
    // through the chassis envelope. Without this, commander writes directly
    // to stderr and calls process.exit itself.
    .exitOverride()
    // Suppress commander's own stderr writes — we replace them with
    // envelope output at the boundary.
    .configureOutput({
      writeOut: (s) => globals.streams.stdout.write(s),
      writeErr: () => {
        /* swallow; errors go through the chassis envelope via exitOverride */
      },
    });

  // --- etak init ---------------------------------------------------------
  //
  // `init` is special: it runs BEFORE any adapter exists, so it does not
  // call createCommandContext(). It uses plain fs and returns a success
  // envelope directly.
  program
    .command('init')
    .description('initialize .etak/artifacts/ in the current project')
    .option('--with-config', 'also write a minimal etak.config.json')
    .action(async (cmdOpts: { withConfig?: boolean }) => {
      const globalOpts = program.opts<{ root?: string }>();
      const initOpts: InitOptions = {};
      if (globalOpts.root !== undefined) initOpts.root = globalOpts.root;
      if (cmdOpts.withConfig) initOpts.withConfig = true;

      const code = await runCommand({
        command: 'init',
        mode: globals.mode,
        streams: globals.streams,
        handler: () => runInit(initOpts, globals.cwd),
        humanSummary: initHumanSummary,
        ...(globals.color !== undefined ? { color: globals.color } : {}),
      });
      setExitCode(code);
    });

  // --- etak <type> subcommand groups -------------------------------------
  //
  // M1-S6 ships real handlers for `idea`. The other five types remain
  // stubs that exit 4 with "not implemented in M1". M2 will replace the
  // remaining five by calling their registration functions here alongside
  // `registerIdeaCommands`.
  const typedGlobals: ChassisGlobals = {
    ...globals,
    exit: setExitCode,
  };
  registerIdeaCommands(program, { globals: typedGlobals });
  registerObjectiveCommands(program, { globals: typedGlobals });
  registerOpportunityCommands(program, { globals: typedGlobals });
  for (const type of ARTIFACT_TYPES) {
    if (type === 'idea' || type === 'objective' || type === 'opportunity') continue;
    registerNotImplementedType(program, type, typedGlobals);
  }

  return program;
}

// ---------------------------------------------------------------------------
// main()
// ---------------------------------------------------------------------------

export interface MainOptions {
  argv: readonly string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  streams?: StreamPair & { stdout: NodeJS.WriteStream; stderr: NodeJS.WriteStream };
}

/**
 * Run the CLI. Returns the exit code instead of calling `process.exit`, so
 * it's directly testable. The shell-facing `main()` in the binary calls
 * `process.exit(await run(...))` at the very bottom of this file.
 */
export async function run(opts: MainOptions): Promise<number> {
  const streams = opts.streams ?? {
    stdout: process.stdout,
    stderr: process.stderr,
  };
  const env = opts.env ?? process.env;
  const cwd = opts.cwd ?? process.cwd();

  // Peek global flags from argv so we can pick the output mode BEFORE
  // commander has a chance to throw on a bad subcommand. This is the only
  // way commander-level errors can route through the same envelope shape
  // as handler errors.
  //
  // We also eagerly validate `--output <mode>` here rather than leaving it
  // to commander: commander's `-o <mode>` option accepts any string, but
  // the spec only defines "human" and "json". A bad value is a
  // user-correctable validation error (exit 1).
  const rawPeeked = peekRawOutput(opts.argv.slice(2));
  const peeked = peekGlobalFlags(opts.argv.slice(2));
  let mode: OutputMode;
  if (rawPeeked !== undefined) {
    try {
      mode = parseOutputMode(rawPeeked);
    } catch {
      // Render the validation error through the envelope and exit 1.
      // Use JSON by default (it's probably piped), and respect NO_COLOR
      // via the usual picocolors path for human mode.
      const fallbackMode: OutputMode = streams.stdout.isTTY ? 'human' : 'json';
      const err = new ValidationError(
        `--output must be "human" or "json"; got "${rawPeeked}"`,
        { details: { received: rawPeeked } },
      );
      const envelope = envelopeError('etak', [err.toStructuredError()]);
      const writeOpts = peeked.color !== undefined ? { color: peeked.color } : {};
      writeResult(envelope, fallbackMode, streams, writeOpts);
      return EXIT_VALIDATION;
    }
  } else {
    mode = detectOutputMode({ stdout: streams.stdout });
  }

  let exitCode = 0;
  const setExitCode = (code: number): void => {
    exitCode = code;
  };

  const globals: ChassisGlobals = {
    cwd,
    env,
    streams,
    mode,
    ...(peeked.color !== undefined ? { color: peeked.color } : {}),
    exit: setExitCode,
  };

  const program = buildProgram({ globals, setExitCode });

  try {
    await program.parseAsync(opts.argv.slice(), { from: 'node' });
  } catch (err) {
    // commander throws CommanderError for version/help/usage conditions
    // because we called `.exitOverride()`. We classify each.
    if (err instanceof CommanderError) {
      return handleCommanderError(err, globals);
    }
    // Defensive: every handler goes through `runCommand`, which catches
    // internally and never rethrows past the boundary — so in practice
    // only CommanderError reaches this catch. We keep the branch to guard
    // against a future change that introduces a sync throw outside a
    // handler (e.g. a top-level wiring error during `buildProgram`). If
    // that ever fires, we still want it rendered through the envelope
    // rather than crashing with an unhandled rejection.
    return handleUnexpectedError(err, globals);
  }

  return exitCode;
}

function handleCommanderError(err: CommanderError, globals: ChassisGlobals): number {
  // commander emits these with a `code` string. See:
  // https://github.com/tj/commander.js/blob/master/lib/error.js
  switch (err.code) {
    case 'commander.version':
    case 'commander.help':
    case 'commander.helpDisplayed':
      // `--version` / `--help` — commander already wrote the output via
      // our configureOutput hook. Exit 0.
      return 0;
    case 'commander.unknownCommand':
    case 'commander.unknownOption':
    case 'commander.missingArgument':
    case 'commander.missingMandatoryOptionValue':
    case 'commander.invalidArgument':
    case 'commander.excessArguments': {
      // Route through the envelope as a usage error, exit 4.
      const envelope = envelopeError('etak', [
        { code: 'E_USAGE', message: err.message },
      ]);
      const writeOpts = globals.color !== undefined ? { color: globals.color } : {};
      writeResult(envelope, globals.mode, globals.streams, writeOpts);
      return EXIT_USAGE;
    }
    default: {
      // Any other commander code — treat as usage error by default.
      const envelope = envelopeError('etak', [
        { code: 'E_USAGE', message: err.message },
      ]);
      const writeOpts = globals.color !== undefined ? { color: globals.color } : {};
      writeResult(envelope, globals.mode, globals.streams, writeOpts);
      return EXIT_USAGE;
    }
  }
}

function handleUnexpectedError(err: unknown, globals: ChassisGlobals): number {
  const message = err instanceof Error ? err.message : String(err);
  const envelope = envelopeError('etak', [
    { code: 'E_INTERNAL', message },
  ]);
  const writeOpts = globals.color !== undefined ? { color: globals.color } : {};
  writeResult(envelope, globals.mode, globals.streams, writeOpts);
  return exitCodeFor(err);
}

// Re-export types for tests.
export { UsageError };

// ---------------------------------------------------------------------------
// Shell entry point
// ---------------------------------------------------------------------------

// Only run when executed as a script (i.e. via the `etak` bin), not when
// imported by tests. tsup's `banner` adds a shebang, and node invokes this
// file directly — `import.meta.url` matches the entry file path.
const isDirectEntry = import.meta.url === `file://${process.argv[1]}`;
if (isDirectEntry) {
  run({ argv: process.argv }).then(
    (code) => process.exit(code),
    (err: unknown) => {
      // Last-resort fallback — should be unreachable because run() catches
      // everything internally, but we don't want an unhandled promise
      // rejection to swallow the exit code.
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`etak: internal error: ${message}\n`);
      process.exit(3);
    },
  );
}
