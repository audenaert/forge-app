// Unit coverage for the slug-derivation helper used by `etak idea create`.
// The helper is pure and trivial, but the rules it encodes come straight
// from design spec §5 — tests pin them so future changes show up in the
// diff rather than silently shifting behavior.

import { describe, expect, it } from 'vitest';

import { deriveSlug } from '../../../src/commands/idea/shared.js';

describe('deriveSlug', () => {
  it('lowercases and kebab-cases a multi-word name', () => {
    expect(deriveSlug('My New Idea')).toBe('my-new-idea');
  });

  it('collapses runs of non-alphanumerics into a single dash', () => {
    expect(deriveSlug('Hello / World!! & more')).toBe('hello-world-more');
  });

  it('trims leading and trailing dashes', () => {
    expect(deriveSlug('...Leading...')).toBe('leading');
  });

  it('returns null for inputs that collapse to fewer than 3 characters', () => {
    expect(deriveSlug('!!')).toBeNull();
    expect(deriveSlug('ok')).toBeNull();
  });

  it('accepts 3-character inputs', () => {
    expect(deriveSlug('foo')).toBe('foo');
  });

  it('truncates to 80 characters at the last safe dash boundary', () => {
    const long = Array.from({ length: 20 }, (_, i) => `word${i}`).join(' ');
    const slug = deriveSlug(long);
    expect(slug).not.toBeNull();
    expect(slug!.length).toBeLessThanOrEqual(80);
    // Should end on an alphanumeric, not a dash.
    expect(slug![slug!.length - 1]).toMatch(/[a-z0-9]/);
  });

  it('preserves numbers', () => {
    expect(deriveSlug('Version 2 Launch')).toBe('version-2-launch');
  });
});
