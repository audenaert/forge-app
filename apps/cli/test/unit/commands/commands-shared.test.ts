// Unit coverage for the helpers in `src/commands/shared.ts`. These used
// to live as per-type copies under `idea/shared.ts` and `objective/shared.ts`
// with matching per-type test files; M2 extract pass 1 consolidated them
// here so the rules are pinned once for every type that reuses them.
//
// The `deriveSlug` and `splitKv` cases are the union of the original
// idea-shared and objective-shared test files — both suites covered the
// same helper from two call sites, so every original `it()` block is
// preserved verbatim to keep the test count stable across the refactor.

import { describe, expect, it } from 'vitest';

import {
  REQUIRED_SECTION_PLACEHOLDER,
  deriveSlug,
  scaffoldCanonicalBody,
  splitKv,
} from '../../../src/commands/shared.js';
import type { SectionedBodyTemplate } from '../../../src/schemas/types.js';
import { ValidationError } from '../../../src/adapters/errors.js';

describe('deriveSlug (from idea-shared suite)', () => {
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

describe('deriveSlug (from objective-shared suite)', () => {
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

describe('splitKv (from objective-shared suite)', () => {
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

describe('scaffoldCanonicalBody', () => {
  // Minimal two-section template: one required, one optional. Exercises
  // both branches of the required-section placeholder selector without
  // coupling the test to any real per-type template.
  const template: SectionedBodyTemplate = {
    kind: 'sectioned',
    sections: [
      { slug: 'summary', name: 'Summary', order: 1, required: true },
      { slug: 'notes', name: 'Notes', order: 2, required: false },
    ],
  };

  it('fills required sections with the TODO placeholder and leaves optional sections empty', () => {
    const body = scaffoldCanonicalBody(template);
    expect(body.sections).toHaveLength(2);
    expect(body.sections[0]).toMatchObject({
      heading: 'Summary',
      slug: 'summary',
      status: 'canonical',
      canonicalOrder: 1,
      content: REQUIRED_SECTION_PLACEHOLDER,
    });
    expect(body.sections[1]).toMatchObject({
      heading: 'Notes',
      slug: 'notes',
      status: 'canonical',
      canonicalOrder: 2,
      content: '',
    });
    expect(body.warnings).toEqual([]);
  });

  it('produces sections in template declaration order', () => {
    const body = scaffoldCanonicalBody(template);
    expect(body.sections.map((s) => s.slug)).toEqual(['summary', 'notes']);
  });
});
