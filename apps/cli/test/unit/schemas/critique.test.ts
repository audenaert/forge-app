import { describe, it, expect } from 'vitest';

import {
  CritiqueFrontmatterSchema,
  CritiqueBodyTemplate,
} from '../../../src/schemas/index.js';

import { readFixtureFrontmatter } from './helpers.js';

const baseCritique = {
  name: 'Critique of AI-powered related works suggestions',
  type: 'critique' as const,
  target: 'idea-ai-powered-related-works',
  personas_used: ['Tenured professor resistant to AI'],
  frameworks_used: ['Pre-mortem'],
  date: '2026-03-31',
  artifacts_created: ['researchers-trust-ai-suggestions'],
};

describe('CritiqueFrontmatterSchema', () => {
  it('accepts a valid critique', () => {
    const parsed = CritiqueFrontmatterSchema.parse(baseCritique);
    expect(parsed.target).toBe('idea-ai-powered-related-works');
    expect(parsed.personas_used).toHaveLength(1);
  });

  it('defaults empty arrays when list fields are omitted', () => {
    const parsed = CritiqueFrontmatterSchema.parse({
      name: 'Critique X',
      type: 'critique',
      target: 'idea-x',
      date: '2026-04-01',
    });
    expect(parsed.personas_used).toEqual([]);
    expect(parsed.frameworks_used).toEqual([]);
    expect(parsed.artifacts_created).toEqual([]);
  });

  it('rejects a missing target', () => {
    const { target: _omit, ...rest } = baseCritique;
    const result = CritiqueFrontmatterSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects a non-literal type field', () => {
    const result = CritiqueFrontmatterSchema.safeParse({
      ...baseCritique,
      type: 'idea',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-slug target', () => {
    const result = CritiqueFrontmatterSchema.safeParse({
      ...baseCritique,
      target: 'Not A Slug!',
    });
    expect(result.success).toBe(false);
  });

  it('passthrough preserves a stray status field — critique has no typed status', () => {
    // Documents the consequence of `.passthrough()`: an author who writes
    // `status:` on a critique will not be caught by Zod (critique declares
    // no `status` field). The drift detector landing in M1-S5 will flag
    // this via `unknown_frontmatter_field` instead.
    const parsed = CritiqueFrontmatterSchema.parse({
      ...baseCritique,
      status: 'active',
    });
    expect((parsed as { status?: unknown }).status).toBe('active');
  });
});

describe('CritiqueBodyTemplate', () => {
  it('is opaque — no sections declared', () => {
    expect(CritiqueBodyTemplate.kind).toBe('opaque');
  });
});

describe('real fixture round-trip', () => {
  it('critique-of-wiki-style-discovery-navigator.md frontmatter parses cleanly', () => {
    const fm = readFixtureFrontmatter(
      'critiques/critique-of-wiki-style-discovery-navigator.md',
    );
    const parsed = CritiqueFrontmatterSchema.parse(fm);
    expect(parsed.type).toBe('critique');
    expect(parsed.target).toBe('wiki-style-discovery-navigator');
    expect(parsed.personas_used.length).toBeGreaterThan(0);
  });
});
