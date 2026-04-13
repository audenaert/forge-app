import { describe, expect, it } from 'vitest';
import {
  AdapterError,
  NotFoundError,
  NotWiredError,
  ValidationError,
} from '../../../src/adapters/errors.js';
import {
  EXIT_ADAPTER,
  EXIT_NOT_FOUND,
  EXIT_USAGE,
  EXIT_VALIDATION,
  UsageError,
  exitCodeFor,
} from '../../../src/errors/exit-codes.js';

describe('exitCodeFor', () => {
  it('maps ValidationError to 1', () => {
    expect(exitCodeFor(new ValidationError('bad'))).toBe(EXIT_VALIDATION);
  });

  it('maps NotFoundError to 2', () => {
    expect(exitCodeFor(new NotFoundError('missing'))).toBe(EXIT_NOT_FOUND);
  });

  it('maps AdapterError to 3', () => {
    expect(exitCodeFor(new AdapterError('io'))).toBe(EXIT_ADAPTER);
  });

  it('maps NotWiredError to 3', () => {
    expect(exitCodeFor(new NotWiredError('graphql', 'create'))).toBe(EXIT_ADAPTER);
  });

  it('maps UsageError to 4', () => {
    expect(exitCodeFor(new UsageError('unknown command'))).toBe(EXIT_USAGE);
  });

  it('maps unknown throws to 3 as a conservative default', () => {
    expect(exitCodeFor(new Error('oops'))).toBe(EXIT_ADAPTER);
    expect(exitCodeFor('string-throw')).toBe(EXIT_ADAPTER);
    expect(exitCodeFor(undefined)).toBe(EXIT_ADAPTER);
  });
});
