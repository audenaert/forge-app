// The top-level error boundary.
//
// Every CLI command runs through `runCommand`. The handler either resolves
// with a success `Envelope` (which `runCommand` renders and returns exit 0)
// or throws — in which case `runCommand` catches the error, classifies it
// (Zod, adapter, plain), projects it into a `StructuredError[]`, wraps it
// in an error envelope, routes it to stderr, and returns the mapped exit
// code. Handlers must never call `process.exit`; the chassis owns that.
//
// Design refs: §4.3 (exit codes), §4.4 (stderr routing), §7 (Zod flattening).

import { ZodError } from 'zod';
import {
  AdapterBaseError,
} from '../adapters/errors.js';
import type { Envelope } from '../output/envelope.js';
import { envelopeError } from '../output/envelope.js';
import { writeResult, type StreamPair, type WriteResultOptions } from '../output/write.js';
import type { OutputMode } from '../output/tty.js';
import type { StructuredError } from '../schemas/index.js';
import {
  EXIT_SUCCESS,
  UsageError,
  exitCodeFor,
} from './exit-codes.js';
import { zodErrorToStructured } from './zod-to-structured.js';

export interface RunCommandOptions<T> {
  command: string;
  mode: OutputMode;
  streams: StreamPair;
  /** Handler returns the success envelope; throws on error. */
  handler: () => Promise<Envelope<T>>;
  /** Optional human-mode summary formatter. */
  humanSummary?: (data: T) => string;
  /** Force color on/off; leave unset in production. */
  color?: boolean;
}

/**
 * Run a command handler under the top-level boundary. Never throws — all
 * errors are converted into error envelopes and an exit code is returned.
 * The caller (the CLI entry point) then invokes `process.exit` with the
 * returned code.
 */
export async function runCommand<T>(
  opts: RunCommandOptions<T>,
): Promise<number> {
  try {
    const envelope = await opts.handler();
    const writeOpts: WriteResultOptions<T> = {};
    if (opts.humanSummary !== undefined) writeOpts.humanSummary = opts.humanSummary;
    if (opts.color !== undefined) writeOpts.color = opts.color;
    writeResult(envelope, opts.mode, opts.streams, writeOpts);
    return EXIT_SUCCESS;
  } catch (err) {
    const errors = classifyError(err);
    const envelope = envelopeError(opts.command, errors);
    const writeOpts: WriteResultOptions<null> = {};
    if (opts.color !== undefined) writeOpts.color = opts.color;
    writeResult<null>(envelope, opts.mode, opts.streams, writeOpts);
    return exitCodeFor(err);
  }
}

/** Project any thrown value into one or more `StructuredError` entries. */
export function classifyError(err: unknown): StructuredError[] {
  if (err instanceof ZodError) {
    return zodErrorToStructured(err);
  }
  if (err instanceof AdapterBaseError) {
    return [err.toStructuredError()];
  }
  if (err instanceof UsageError) {
    return [{ code: 'E_USAGE', message: err.message }];
  }
  if (err instanceof Error) {
    // Best-effort for uncaught runtime errors — surface the message, not
    // the full stack. The chassis does not swallow errors silently; it
    // maps them to exit 3 and prints them on stderr via the envelope.
    return [
      {
        code: 'E_INTERNAL',
        message: err.message,
        details: { name: err.name },
      },
    ];
  }
  return [{ code: 'E_INTERNAL', message: String(err) }];
}
