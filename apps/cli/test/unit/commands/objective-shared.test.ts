// Unit coverage for the helpers local to `etak objective *`. Because M2
// Round 1 deliberately duplicates the idea/shared.ts helpers rather than
// extracting them, these tests pin the objective-local copy against the
// same spec rules. When the extract pass lands, these tests either
// collapse into a single shared test file or stay as thin sanity checks
// that the objective package still calls through to the shared helper.

import { describe, expect, it } from 'vitest';

import { deriveSlug } from '../../../src/commands/shared.js';
import { splitKv } from '../../../src/commands/objective/update.js';
import { ValidationError } from '../../../src/adapters/errors.js';

describe('objective/shared deriveSlug', () => {
  it('lowercases and kebab-cases a multi-word name', () => {
    expect(deriveSlug('My Top-Level Objective')).toBe('my-top-level-objective');
  });

  it('collapses runs of non-alphanumerics into a single dash', () => {
    expect(deriveSlug('Ship / Grow!! & retain')).toBe('ship-grow-retain');
  });

  it('returns null for inputs that collapse to fewer than 3 characters', () => {
    expect(deriveSlug('!!')).toBeNull();
    expect(deriveSlug('ok')).toBeNull();
  });

  it('preserves numbers', () => {
    expect(deriveSlug('Q4 2026 Objective')).toBe('q4-2026-objective');
  });

  it('truncates to 80 characters at the last safe dash boundary', () => {
    const long = Array.from({ length: 20 }, (_, i) => `word${i}`).join(' ');
    const slug = deriveSlug(long);
    expect(slug).not.toBeNull();
    expect(slug!.length).toBeLessThanOrEqual(80);
    expect(slug![slug!.length - 1]).toMatch(/[a-z0-9]/);
  });
});

describe('objective/update splitKv', () => {
  it('splits on the first "=" and preserves additional "=" in the value', () => {
    const { slug, value } = splitKv('success_criteria=a=b=c', '--section');
    expect(slug).toBe('success_criteria');
    expect(value).toBe('a=b=c');
  });

  it('accepts an empty content portion', () => {
    const { slug, value } = splitKv('description=', '--section');
    expect(slug).toBe('description');
    expect(value).toBe('');
  });

  it('rejects an empty slug portion', () => {
    expect(() => splitKv('=foo', '--section')).toThrow(ValidationError);
  });

  it('rejects a missing "=" delimiter', () => {
    expect(() => splitKv('description', '--section')).toThrow(ValidationError);
  });
});
