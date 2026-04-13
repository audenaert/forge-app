// JSON envelope for @etak/cli command output.
//
// Every command — success or failure — produces exactly one `Envelope`,
// which is then rendered into JSON or human output by the sibling render
// module. This split guarantees the two output modes can never drift from
// each other: the human renderer is a projection of the same envelope the
// JSON renderer serializes.
//
// Shape is per design spec §4.1 with the version constant taken from the
// M1-S5 story description: `schema: "etak-cli/v1"`. Bumping the version
// lets downstream consumers version-gate parsing on a breaking change.

import type { DriftWarning, StructuredError } from '../schemas/index.js';

export const ENVELOPE_SCHEMA = 'etak-cli/v1' as const;

export type EnvelopeStatus = 'success' | 'error';

export interface Envelope<T = unknown> {
  readonly schema: typeof ENVELOPE_SCHEMA;
  /** Canonical subcommand path, e.g. "init", "idea create". */
  readonly command: string;
  readonly status: EnvelopeStatus;
  /** Command-specific payload. `null` on error. */
  readonly data: T | null;
  /**
   * Drift warnings from the adapter and/or user-input validation. Always an
   * array — callers can unconditionally iterate without optional-chaining,
   * which is load-bearing for the drift contract (design §4.1).
   */
  readonly warnings: readonly DriftWarning[];
  /** Structured errors. Empty on success, non-empty on error. */
  readonly errors: readonly StructuredError[];
}

/** Build a success envelope. */
export function envelopeSuccess<T>(
  command: string,
  data: T,
  warnings: readonly DriftWarning[] = [],
): Envelope<T> {
  return {
    schema: ENVELOPE_SCHEMA,
    command,
    status: 'success',
    data,
    warnings,
    errors: [],
  };
}

/** Build an error envelope. `data` is always `null` on errors. */
export function envelopeError(
  command: string,
  errors: readonly StructuredError[],
  warnings: readonly DriftWarning[] = [],
): Envelope<null> {
  return {
    schema: ENVELOPE_SCHEMA,
    command,
    status: 'error',
    data: null,
    warnings,
    errors,
  };
}
