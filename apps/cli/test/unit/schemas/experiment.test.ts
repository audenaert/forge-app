import { describe, it, expect } from 'vitest';

import {
  ExperimentFrontmatterSchema,
  ExperimentBodyTemplate,
} from '../../../src/schemas/index.js';

const baseExperiment = {
  name: 'Interview 5 researchers about related-works discovery',
  type: 'experiment' as const,
  status: 'planned' as const,
  tests: ['researchers-trust-ai-suggestions'],
  method: 'user_interview' as const,
  success_criteria: '3 of 5 interviewees explicitly cite the pain point',
  duration: '2 weeks',
  effort: 'medium' as const,
};

describe('ExperimentFrontmatterSchema', () => {
  it('accepts a valid experiment with required fields', () => {
    const parsed = ExperimentFrontmatterSchema.parse(baseExperiment);
    expect(parsed.method).toBe('user_interview');
    expect(parsed.tests).toEqual(['researchers-trust-ai-suggestions']);
  });

  it('accepts an optional structured action_plan', () => {
    const parsed = ExperimentFrontmatterSchema.parse({
      ...baseExperiment,
      action_plan: {
        if_validated: 'Proceed to prototype',
        if_invalidated: 'Reframe the opportunity',
        if_inconclusive: 'Run a second round with different personas',
      },
    });
    expect(parsed.action_plan?.if_validated).toContain('prototype');
  });

  it('rejects an invalid method', () => {
    const result = ExperimentFrontmatterSchema.safeParse({
      ...baseExperiment,
      method: 'ouija_board',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing success_criteria', () => {
    const { success_criteria: _omit, ...rest } = baseExperiment;
    const result = ExperimentFrontmatterSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects a non-literal type field', () => {
    const result = ExperimentFrontmatterSchema.safeParse({
      ...baseExperiment,
      type: 'idea',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an action_plan with a blank branch', () => {
    const result = ExperimentFrontmatterSchema.safeParse({
      ...baseExperiment,
      action_plan: {
        if_validated: '',
        if_invalidated: 'X',
        if_inconclusive: 'Y',
      },
    });
    expect(result.success).toBe(false);
  });
});

describe('ExperimentBodyTemplate', () => {
  it('is provisional and declares plan as the only required section', () => {
    expect(ExperimentBodyTemplate.kind).toBe('sectioned');
    if (ExperimentBodyTemplate.kind !== 'sectioned') return;
    const required = ExperimentBodyTemplate.sections
      .filter((s) => s.required)
      .map((s) => s.slug);
    expect(required).toEqual(['plan']);
  });
});

describe.skip('real fixture round-trip (provisional — unblocked by M3-S5)', () => {
  it('real experiment fixture frontmatter parses cleanly', () => {
    // Placeholder — M3-S5 will wire this up against the first real fixture.
  });
});
