import { describe, it, expect } from 'vitest';

import {
  AssumptionFrontmatterSchema,
  AssumptionBodyTemplate,
} from '../../../src/schemas/index.js';

import { readFixtureFrontmatter } from './helpers.js';

describe('AssumptionFrontmatterSchema', () => {
  it('accepts a valid assumption', () => {
    const parsed = AssumptionFrontmatterSchema.parse({
      name: 'Users trust AI suggestions',
      type: 'assumption',
      status: 'untested',
      importance: 'high',
      evidence: 'low',
      assumed_by: ['ai-powered-related-works'],
    });
    expect(parsed.importance).toBe('high');
    expect(parsed.evidence).toBe('low');
  });

  it('rejects an invalid status', () => {
    const result = AssumptionFrontmatterSchema.safeParse({
      name: 'X',
      type: 'assumption',
      status: 'proven',
      importance: 'high',
      evidence: 'low',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing importance level', () => {
    const result = AssumptionFrontmatterSchema.safeParse({
      name: 'X',
      type: 'assumption',
      status: 'untested',
      evidence: 'low',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-literal type field', () => {
    const result = AssumptionFrontmatterSchema.safeParse({
      name: 'X',
      type: 'idea',
      status: 'untested',
      importance: 'high',
      evidence: 'low',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid evidence level', () => {
    const result = AssumptionFrontmatterSchema.safeParse({
      name: 'X',
      type: 'assumption',
      status: 'untested',
      importance: 'high',
      evidence: 'maybe',
    });
    expect(result.success).toBe(false);
  });
});

describe('AssumptionBodyTemplate', () => {
  it('is provisional and sectioned', () => {
    expect(AssumptionBodyTemplate.kind).toBe('sectioned');
    if (AssumptionBodyTemplate.kind !== 'sectioned') return;
    const slugs = AssumptionBodyTemplate.sections.map((s) => s.slug);
    expect(slugs).toEqual(['description', 'why_this_matters', 'evidence']);
  });
});

// The design spec calls assumption a "no live fixture" type (body template
// is provisional), but two real assumption files do exist under
// `docs/discovery/assumptions/` — they only exercise the frontmatter shape,
// not the body template. We still round-trip their frontmatter here so any
// schema drift in the fields we DO model surfaces immediately. Body-template
// recalibration is still tracked as an M3 chore.
describe('real fixture round-trip (frontmatter only — body template is provisional)', () => {
  it('pm-dev-role-convergence.md frontmatter parses cleanly', () => {
    const fm = readFixtureFrontmatter('assumptions/pm-dev-role-convergence.md');
    const parsed = AssumptionFrontmatterSchema.parse(fm);
    expect(parsed.type).toBe('assumption');
    expect(parsed.importance).toBe('high');
  });

  it('small-graphs-dont-need-navigation.md frontmatter parses cleanly', () => {
    const fm = readFixtureFrontmatter(
      'assumptions/small-graphs-dont-need-navigation.md',
    );
    const parsed = AssumptionFrontmatterSchema.parse(fm);
    expect(parsed.type).toBe('assumption');
    expect(parsed.evidence).toBe('low');
  });
});
