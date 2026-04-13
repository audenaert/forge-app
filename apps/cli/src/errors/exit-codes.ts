// Exit-code mapping per design spec §4.3.
//
// Locked values:
//   0 = success
//   1 = validation error (Zod or user-correctable input failure)
//   2 = not found (slug/file doesn't exist)
//   3 = adapter/IO error or environment error (filesystem, disk, missing
//       project root, NotWired, uninitialized project, missing config,
//       invalid ETAK_BACKEND value — anything environmental rather than
//       user-input-shaped)
//   4 = unknown command / usage error
//
// Any uncaught thrown value that isn't an adapter error maps to 3 as a
// conservative default — it means the chassis caught something it didn't
// recognize and is best-effort reporting it as an IO/runtime failure.
// This is why `E_INTERNAL` (unexpected error code) also resolves to exit
// 3: unexpected runtime failures are almost always environmental (a
// runtime, filesystem, or process-level problem), not user input. If
// something ever surfaces as a genuine logic bug rather than an
// environment issue, we can split out a dedicated code then.

import { ZodError } from 'zod';
import {
  AdapterBaseError,
  AdapterError,
  NotFoundError,
  NotWiredError,
  ValidationError,
} from '../adapters/errors.js';

export const EXIT_SUCCESS = 0;
export const EXIT_VALIDATION = 1;
export const EXIT_NOT_FOUND = 2;
export const EXIT_ADAPTER = 3;
export const EXIT_USAGE = 4;

/**
 * Sentinel used by the chassis when commander itself raises a usage error
 * (unknown command, unknown flag, missing required argument). It is NOT an
 * adapter error — it maps directly to exit 4.
 */
export class UsageError extends Error {
  public readonly code = 'E_USAGE';
  public readonly exitCode = EXIT_USAGE;

  public constructor(message: string) {
    super(message);
    this.name = 'UsageError';
  }
}

/**
 * Resolve any thrown value to a numeric exit code. Falls back to 3 for
 * unknown errors — a shell-level runtime failure is closer to an adapter
 * failure than a usage error.
 */
export function exitCodeFor(err: unknown): number {
  if (err instanceof UsageError) return EXIT_USAGE;
  if (err instanceof ZodError) return EXIT_VALIDATION;
  if (err instanceof ValidationError) return EXIT_VALIDATION;
  if (err instanceof NotFoundError) return EXIT_NOT_FOUND;
  if (err instanceof AdapterError) return EXIT_ADAPTER;
  if (err instanceof NotWiredError) return EXIT_ADAPTER;
  if (err instanceof AdapterBaseError) return err.exitCode;
  return EXIT_ADAPTER;
}
