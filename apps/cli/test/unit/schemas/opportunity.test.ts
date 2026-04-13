import { describe, it, expect } from 'vitest';

import {
  OpportunityFrontmatterSchema,
  OpportunityBodyTemplate,
} from '../../../src/schemas/index.js';

import { readFixtureFrontmatter } from './helpers.js';

describe('OpportunityFrontmatterSchema', () => {
  it('accepts a valid frontmatter object with supports[] links', () => {
    const parsed = OpportunityFrontmatterSchema.parse({
      name: 'HMW help solo devs start?',
      type: 'opportunity',
      status: 'active',
      supports: ['grow-etak-via-local-first-plg'],
    });
    expect(parsed.supports).toEqual(['grow-etak-via-local-first-plg']);
  });

  it('defaults supports[] to empty when omitted', () => {
    const parsed = OpportunityFrontmatterSchema.parse({
      name: 'X',
      type: 'opportunity',
      status: 'active',
    });
    expect(parsed.supports).toEqual([]);
  });

  it('passes through unknown frontmatter fields (e.g. hmw)', () => {
    // Real fixture has an `hmw` field not in the schema. Design.md §3.5
    // treats unknown fields as drift warnings, not validation errors, so
    // the schema must accept them.
    const parsed = OpportunityFrontmatterSchema.parse({
      name: 'X',
      type: 'opportunity',
      status: 'active',
      hmw: 'HMW do the thing?',
    });
    expect((parsed as Record<string, unknown>).hmw).toBe('HMW do the thing?');
  });

  it('rejects an invalid status enum value', () => {
    const result = OpportunityFrontmatterSchema.safeParse({
      name: 'X',
      type: 'opportunity',
      status: 'shipped',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-slug entry in supports[]', () => {
    const result = OpportunityFrontmatterSchema.safeParse({
      name: 'X',
      type: 'opportunity',
      status: 'active',
      supports: ['Not A Slug!'],
    });
    expect(result.success).toBe(false);
  });
});

describe('OpportunityBodyTemplate', () => {
  it('declares description and evidence as required', () => {
    expect(OpportunityBodyTemplate.kind).toBe('sectioned');
    if (OpportunityBodyTemplate.kind !== 'sectioned') return;
    const required = OpportunityBodyTemplate.sections
      .filter((s) => s.required)
      .map((s) => s.slug);
    expect(required).toEqual(['description', 'evidence']);
  });
});

describe('real fixture round-trip', () => {
  it('solo-devs-blocked-by-team-tool-overhead.md frontmatter parses cleanly', () => {
    const fm = readFixtureFrontmatter(
      'opportunities/solo-devs-blocked-by-team-tool-overhead.md',
    );
    const parsed = OpportunityFrontmatterSchema.parse(fm);
    expect(parsed.type).toBe('opportunity');
    expect(parsed.supports).toContain('grow-etak-via-local-first-plg');
  });
});
