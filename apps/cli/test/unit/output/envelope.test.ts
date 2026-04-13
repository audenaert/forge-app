import { describe, expect, it } from 'vitest';
import {
  ENVELOPE_SCHEMA,
  envelopeError,
  envelopeSuccess,
} from '../../../src/output/envelope.js';
import type { DriftWarning, StructuredError } from '../../../src/schemas/index.js';

describe('envelope factories', () => {
  it('envelopeSuccess wraps data with the versioned schema and empty errors', () => {
    const env = envelopeSuccess('init', { root: '/tmp/x' });

    expect(env.schema).toBe(ENVELOPE_SCHEMA);
    expect(env.schema).toBe('etak-cli/v1');
    expect(env.command).toBe('init');
    expect(env.status).toBe('success');
    expect(env.data).toEqual({ root: '/tmp/x' });
    expect(env.warnings).toEqual([]);
    expect(env.errors).toEqual([]);
  });

  it('envelopeSuccess passes warnings through unchanged', () => {
    const w: DriftWarning[] = [
      { kind: 'extra_section', severity: 'info', message: 'bonus section' },
    ];
    const env = envelopeSuccess('idea update', { slug: 'x' }, w);
    expect(env.warnings).toEqual(w);
    expect(env.status).toBe('success');
  });

  it('envelopeError has null data and populated errors', () => {
    const errs: StructuredError[] = [
      { code: 'E_VALIDATION', message: 'bad slug' },
    ];
    const env = envelopeError('idea create', errs);

    expect(env.schema).toBe('etak-cli/v1');
    expect(env.status).toBe('error');
    expect(env.data).toBeNull();
    expect(env.errors).toEqual(errs);
    expect(env.warnings).toEqual([]);
  });

  it('envelopeError carries warnings alongside errors', () => {
    const errs: StructuredError[] = [{ code: 'E_IO', message: 'boom' }];
    const w: DriftWarning[] = [
      { kind: 'dangling_ref', severity: 'warning', message: 'ref' },
    ];
    const env = envelopeError('idea update', errs, w);
    expect(env.warnings).toEqual(w);
    expect(env.errors).toEqual(errs);
  });
});
