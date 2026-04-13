import { describe, it, expect } from 'vitest';

import {
  IdeaFrontmatterSchema,
  IdeaBodyTemplate,
} from '../../../src/schemas/index.js';

import { readFixtureFrontmatter } from './helpers.js';

describe('IdeaFrontmatterSchema', () => {
  it('accepts a valid idea with delivered_by=null', () => {
    const parsed = IdeaFrontmatterSchema.parse({
      name: 'Etak CLI',
      type: 'idea',
      status: 'draft',
      addresses: ['solo-devs-blocked-by-team-tool-overhead'],
      delivered_by: null,
    });
    expect(parsed.delivered_by).toBeNull();
    expect(parsed.status).toBe('draft');
  });

  it('accepts delivered_by as a slug string', () => {
    const parsed = IdeaFrontmatterSchema.parse({
      name: 'Graph store',
      type: 'idea',
      status: 'building',
      addresses: ['no-computational-model-for-opportunity-exploration'],
      delivered_by: 'graph-backed-artifact-store',
    });
    expect(parsed.delivered_by).toBe('graph-backed-artifact-store');
  });

  it('rejects an invalid status', () => {
    const result = IdeaFrontmatterSchema.safeParse({
      name: 'X',
      type: 'idea',
      status: 'in_progress',
      addresses: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects addresses as a single string instead of an array', () => {
    const result = IdeaFrontmatterSchema.safeParse({
      name: 'X',
      type: 'idea',
      status: 'draft',
      addresses: 'solo-devs-blocked-by-team-tool-overhead',
    });
    expect(result.success).toBe(false);
  });
});

describe('IdeaBodyTemplate', () => {
  it('marks strategic_rationale optional so both fixtures round-trip', () => {
    expect(IdeaBodyTemplate.kind).toBe('sectioned');
    if (IdeaBodyTemplate.kind !== 'sectioned') return;
    const rationale = IdeaBodyTemplate.sections.find(
      (s) => s.slug === 'strategic_rationale',
    );
    expect(rationale).toBeDefined();
    expect(rationale?.required).toBe(false);
  });

  it('marks description and why_this_could_work as required', () => {
    if (IdeaBodyTemplate.kind !== 'sectioned') return;
    const required = IdeaBodyTemplate.sections
      .filter((s) => s.required)
      .map((s) => s.slug);
    expect(required).toEqual(['description', 'why_this_could_work']);
  });
});

describe('real fixture round-trip', () => {
  it('etak-cli-as-growth-onramp.md frontmatter parses cleanly', () => {
    const fm = readFixtureFrontmatter('ideas/etak-cli-as-growth-onramp.md');
    const parsed = IdeaFrontmatterSchema.parse(fm);
    expect(parsed.type).toBe('idea');
    expect(parsed.delivered_by).toBeNull();
  });

  it('graph-backed-artifact-store.md frontmatter parses cleanly', () => {
    const fm = readFixtureFrontmatter('ideas/graph-backed-artifact-store.md');
    const parsed = IdeaFrontmatterSchema.parse(fm);
    expect(parsed.type).toBe('idea');
    expect(parsed.delivered_by).toBe('graph-backed-artifact-store');
  });
});
