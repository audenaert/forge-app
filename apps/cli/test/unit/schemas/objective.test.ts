import { describe, it, expect } from 'vitest';

import {
  ObjectiveFrontmatterSchema,
  ObjectiveSchema,
  ObjectiveBodyTemplate,
} from '../../../src/schemas/index.js';

import { EMPTY_BODY, readFixtureFrontmatter } from './helpers.js';

describe('ObjectiveFrontmatterSchema', () => {
  it('accepts a valid frontmatter object', () => {
    const parsed = ObjectiveFrontmatterSchema.parse({
      name: 'Grow Etak',
      type: 'objective',
      status: 'active',
    });
    expect(parsed.name).toBe('Grow Etak');
    expect(parsed.status).toBe('active');
  });

  it('rejects an invalid status enum value', () => {
    const result = ObjectiveFrontmatterSchema.safeParse({
      name: 'X',
      type: 'objective',
      status: 'drafy',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing name field', () => {
    const result = ObjectiveFrontmatterSchema.safeParse({
      type: 'objective',
      status: 'active',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-literal type field', () => {
    const result = ObjectiveFrontmatterSchema.safeParse({
      name: 'X',
      type: 'idea',
      status: 'active',
    });
    expect(result.success).toBe(false);
  });
});

describe('ObjectiveSchema (combined frontmatter + body)', () => {
  it('accepts a valid artifact', () => {
    const parsed = ObjectiveSchema.parse({
      frontmatter: {
        name: 'Grow Etak',
        type: 'objective',
        status: 'active',
      },
      body: EMPTY_BODY,
    });
    expect(parsed.frontmatter.type).toBe('objective');
  });
});

describe('ObjectiveBodyTemplate', () => {
  it('declares a sectioned template with canonical order', () => {
    expect(ObjectiveBodyTemplate.kind).toBe('sectioned');
    if (ObjectiveBodyTemplate.kind !== 'sectioned') return;
    const slugs = ObjectiveBodyTemplate.sections.map((s) => s.slug);
    expect(slugs).toEqual([
      'description',
      'context',
      'success_criteria',
      'out_of_scope',
    ]);
    const required = ObjectiveBodyTemplate.sections
      .filter((s) => s.required)
      .map((s) => s.slug);
    expect(required).toEqual(['description', 'success_criteria']);
  });
});

describe('real fixture round-trip', () => {
  it('grow-etak-via-local-first-plg.md frontmatter parses cleanly', () => {
    const fm = readFixtureFrontmatter('objectives/grow-etak-via-local-first-plg.md');
    const parsed = ObjectiveFrontmatterSchema.parse(fm);
    expect(parsed.type).toBe('objective');
  });

  it('accelerate-product-discovery.md frontmatter parses cleanly', () => {
    const fm = readFixtureFrontmatter('objectives/accelerate-product-discovery.md');
    const parsed = ObjectiveFrontmatterSchema.parse(fm);
    expect(parsed.type).toBe('objective');
  });
});
