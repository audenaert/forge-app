// Unit coverage for the slug-derivation helper used by `etak idea create`.
// The helper is pure and trivial, but the rules it encodes come straight
// from design spec §5 — tests pin them so future changes show up in the
// diff rather than silently shifting behavior.

import { describe, expect, it } from 'vitest';

import { deriveSlug } from '../../../src/commands/idea/shared.js';
import { splitKv } from '../../../src/commands/idea/update.js';
import { ValidationError } from '../../../src/adapters/errors.js';

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

  // ---- edge cases ---------------------------------------------------------

  it('returns null for an empty-string name', () => {
    expect(deriveSlug('')).toBeNull();
  });

  it('returns null for a name that is only invalid characters', () => {
    // Collapses to empty, then fails the 3-char threshold.
    expect(deriveSlug('!!!')).toBeNull();
    expect(deriveSlug('@@@')).toBeNull();
  });

  it('returns null for a name that collapses to just "a-" (trailing-dash strip then too short)', () => {
    // "a-" → trim trailing dash → "a" → fewer than 3 chars → null.
    expect(deriveSlug('a-')).toBeNull();
  });

  it('rejects unicode / emoji characters (returns null when they collapse to empty)', () => {
    // Non-ASCII is treated as non-alphanumeric per the current regex and
    // collapses to nothing. Documents the current behavior rather than
    // silently shifting it.
    expect(deriveSlug('🎉🎊🎈')).toBeNull();
    // ASCII text adjacent to emoji still produces a slug from the ASCII.
    expect(deriveSlug('Hello 🎉 World')).toBe('hello-world');
  });
});

describe('splitKv (update --section flag parser)', () => {
  it('splits on the first "=" and preserves additional "=" in the value', () => {
    const { slug, value } = splitKv('description=a=b=c', '--section');
    expect(slug).toBe('description');
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

  it('rejects a blank slug portion (only whitespace)', () => {
    expect(() => splitKv('   =foo', '--section')).toThrow(ValidationError);
  });
});
