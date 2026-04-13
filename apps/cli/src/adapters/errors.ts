// Error taxonomy for the storage adapter layer.
//
// Each class carries a `StructuredError`-compatible payload (`code`,
// `message`, `location`, `details`) so the CLI envelope renderer (M1-S5)
// can translate thrown errors into `errors[]` entries without a second
// classification pass. Exit-code mapping is fixed per the design spec
// §4.3 and §1 (NotWiredError).

import type {
  ArtifactRef,
  DriftLocation,
  StructuredError,
} from './types.js';

/**
 * Common base for all adapter errors. Subclasses assign a fixed `code` and
 * exit code and may attach a location/details payload.
 */
export abstract class AdapterBaseError extends Error {
  /** `StructuredError.code` for the envelope. */
  public abstract readonly code: string;

  /** Fixed process exit code per §4.3. */
  public abstract readonly exitCode: number;

  public readonly location?: DriftLocation;
  public readonly details?: Record<string, unknown>;

  protected constructor(
    message: string,
    opts?: { location?: DriftLocation; details?: Record<string, unknown> },
  ) {
    super(message);
    this.name = new.target.name;
    this.location = opts?.location;
    this.details = opts?.details;
  }

  /** Project into a `StructuredError` for envelope rendering. */
  public toStructuredError(): StructuredError {
    return {
      code: this.code,
      message: this.message,
      location: this.location,
      details: this.details,
    };
  }
}

/** Zod / schema validation failure. Exit 1. */
export class ValidationError extends AdapterBaseError {
  public readonly code = 'E_VALIDATION';
  public readonly exitCode = 1;

  public constructor(
    message: string,
    opts?: { location?: DriftLocation; details?: Record<string, unknown> },
  ) {
    super(message, opts);
  }
}

/** Ref does not resolve. Exit 2. */
export class NotFoundError extends AdapterBaseError {
  public readonly code = 'E_NOT_FOUND';
  public readonly exitCode = 2;

  public constructor(
    message: string,
    opts?: { ref?: ArtifactRef; location?: DriftLocation; details?: Record<string, unknown> },
  ) {
    const location: DriftLocation | undefined = opts?.location ?? (opts?.ref ? { artifactRef: opts.ref } : undefined);
    super(message, { location, details: opts?.details });
  }
}

/** Adapter/IO error (filesystem permission, corrupted file, network). Exit 3. */
export class AdapterError extends AdapterBaseError {
  public readonly code: string = 'E_IO';
  public readonly exitCode = 3;

  public constructor(
    message: string,
    opts?: { code?: string; location?: DriftLocation; details?: Record<string, unknown> },
  ) {
    super(message, opts);
    if (opts?.code) {
      // Subclass-like override without changing the type.
      (this as { code: string }).code = opts.code;
    }
  }
}

/**
 * The stub GraphQL adapter raises this for every method. Per §1, `code` is
 * `E_NOT_WIRED`, and it maps to exit 3.
 */
export class NotWiredError extends AdapterBaseError {
  public readonly code = 'E_NOT_WIRED';
  public readonly exitCode = 3;
  public readonly adapter: string;
  public readonly operation: string;

  public constructor(adapter: string, operation: string) {
    super(`${adapter} adapter is not wired in v1 (operation: ${operation})`, {
      details: { adapter, operation },
    });
    this.adapter = adapter;
    this.operation = operation;
  }
}
