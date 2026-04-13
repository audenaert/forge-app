// Flatten a ZodError into a list of `StructuredError` entries sharing the
// envelope's location/details shape. Design spec §7.
//
// Each leaf Zod issue becomes one `StructuredError` with `code: E_VALIDATION`.
// `location.field` is the dotted/bracketed path joined from `issue.path`;
// `details.expected` / `details.received` carry Zod's type metadata when
// available so the web UI can eventually render form-style inline errors.

import { ZodError, type ZodIssue } from 'zod';
import type { StructuredError } from '../schemas/index.js';

export function zodErrorToStructured(err: ZodError): StructuredError[] {
  return err.issues.map(issueToStructured);
}

function issueToStructured(issue: ZodIssue): StructuredError {
  const field = formatPath(issue.path);
  const details: Record<string, unknown> = { zodCode: issue.code };

  // Zod's per-code fields are union-narrowed; pick up expected/received
  // where they exist without hard-coding every code.
  const maybe = issue as unknown as {
    expected?: unknown;
    received?: unknown;
  };
  if (maybe.expected !== undefined) details['expected'] = maybe.expected;
  if (maybe.received !== undefined) details['received'] = maybe.received;

  return {
    code: 'E_VALIDATION',
    message: issue.message,
    ...(field ? { location: { field } } : {}),
    details,
  };
}

function formatPath(path: readonly (string | number)[]): string {
  if (path.length === 0) return '';
  let out = '';
  for (const segment of path) {
    if (typeof segment === 'number') {
      out += `[${segment}]`;
    } else if (out === '') {
      out = segment;
    } else {
      out += `.${segment}`;
    }
  }
  return out;
}

export function isZodError(err: unknown): err is ZodError {
  return err instanceof ZodError;
}
