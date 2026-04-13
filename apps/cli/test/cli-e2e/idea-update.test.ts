// e2e for `etak idea update <slug>`. Covers frontmatter updates, section
// replace, whole-body replace from file, missing-slug (exit 2), invalid
// status (exit 1), drift paths (extra-preserved, missing-required), and
// mutually-exclusive flag combinations.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak idea update (built binary e2e)', () => {
  beforeAll(() => assertBuiltBin());

  const cleanups: Array<() => void> = [];
  let dir = '';
  beforeEach(() => {
    const { dir: d, cleanup } = makeTempProject();
    dir = d;
    cleanups.push(cleanup);
    runCli(['init'], { cwd: dir });
    runCli(['idea', 'create', '--name', 'Target Idea'], { cwd: dir });
  });
  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('updates --status and leaves the body untouched', () => {
    const before = readFileSync(
      resolve(dir, '.etak/artifacts/ideas/target-idea.md'),
      'utf8',
    );
    const result = runCli(
      ['idea', 'update', 'target-idea', '--status', 'exploring'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect((env.data as { applied: string[] }).applied).toContain('status');

    const after = readFileSync(
      resolve(dir, '.etak/artifacts/ideas/target-idea.md'),
      'utf8',
    );
    expect(after).toContain('status: exploring');
    // Section headings preserved.
    expect(after).toContain('## Description');
    expect(after).toContain('## Why This Could Work');
    // Body scaffold shape unchanged.
    expect(after.split('## ').length).toBe(before.split('## ').length);
  });

  it('--section slug=content replaces one section only', () => {
    runCli(
      ['idea', 'update', 'target-idea', '--section', 'description=New description body.'],
      { cwd: dir },
    );
    const content = readFileSync(
      resolve(dir, '.etak/artifacts/ideas/target-idea.md'),
      'utf8',
    );
    expect(content).toContain('New description body.');
    // Other sections still present.
    expect(content).toContain('## Why This Could Work');
  });

  it('--body-file replaces the whole body, frontmatter preserved', () => {
    const replacement =
      '## Description\n\nReplaced description.\n\n## Why This Could Work\n\nReplaced rationale.\n';
    const path = resolve(dir, 'new-body.md');
    writeFileSync(path, replacement, 'utf8');

    const result = runCli(
      ['idea', 'update', 'target-idea', '--body-file', path],
      { cwd: dir },
    );
    expect(result.status).toBe(0);

    const content = readFileSync(
      resolve(dir, '.etak/artifacts/ideas/target-idea.md'),
      'utf8',
    );
    // Frontmatter preserved.
    expect(content).toContain('name: Target Idea');
    expect(content).toContain('type: idea');
    // Body replaced.
    expect(content).toContain('Replaced description.');
    expect(content).toContain('Replaced rationale.');
  });

  it('exits 2 when updating a slug that does not exist', () => {
    const result = runCli(
      ['idea', 'update', 'nope', '--status', 'exploring'],
      { cwd: dir },
    );
    expect(result.status).toBe(2);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_NOT_FOUND');
  });

  it('exits 1 when --status is an invalid enum value', () => {
    const result = runCli(
      ['idea', 'update', 'target-idea', '--status', 'wat'],
      { cwd: dir },
    );
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
  });

  it('drift: extra section is preserved across an update', () => {
    // Hand-edit to add an extra section.
    const file = resolve(dir, '.etak/artifacts/ideas/target-idea.md');
    const withExtra = `---
name: Target Idea
type: idea
status: draft
addresses: []
delivered_by: []
---

## Description

d

## Why This Could Work

w

## Notes

Human added this.
`;
    writeFileSync(file, withExtra, 'utf8');

    const result = runCli(
      ['idea', 'update', 'target-idea', '--status', 'exploring'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const extras = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'extra_section',
    );
    expect(extras.length).toBeGreaterThanOrEqual(1);

    const after = readFileSync(file, 'utf8');
    expect(after).toContain('## Notes');
    expect(after).toContain('Human added this.');
  });

  it('drift: missing required section warns but update still succeeds', () => {
    // Hand-edit to drop the required "Why This Could Work" section.
    const file = resolve(dir, '.etak/artifacts/ideas/target-idea.md');
    const dropped = `---
name: Target Idea
type: idea
status: draft
addresses: []
delivered_by: []
---

## Description

only description
`;
    writeFileSync(file, dropped, 'utf8');

    const result = runCli(
      ['idea', 'update', 'target-idea', '--status', 'exploring'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const missing = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'missing_required_section',
    );
    expect(missing.length).toBeGreaterThanOrEqual(1);
  });

  it('rejects --section mixed with --body (mutually exclusive forms)', () => {
    const result = runCli(
      [
        'idea',
        'update',
        'target-idea',
        '--section',
        'description=x',
        '--body',
        'y',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
    expect(env.errors[0]?.message).toMatch(/mutually exclusive/);
  });

  it('adds and removes addresses via --add-addresses / --remove-addresses', () => {
    runCli(
      [
        'idea',
        'update',
        'target-idea',
        '--add-addresses',
        'opp-a',
        '--add-addresses',
        'opp-b',
      ],
      { cwd: dir },
    );
    let content = readFileSync(
      resolve(dir, '.etak/artifacts/ideas/target-idea.md'),
      'utf8',
    );
    // yaml v2 renders a two-element array as a block sequence. Assert on
    // the flattened form rather than a regex that assumes inline array.
    expect(content).toContain('opp-a');
    expect(content).toContain('opp-b');

    runCli(
      ['idea', 'update', 'target-idea', '--remove-addresses', 'opp-a'],
      { cwd: dir },
    );
    content = readFileSync(
      resolve(dir, '.etak/artifacts/ideas/target-idea.md'),
      'utf8',
    );
    expect(content).not.toContain('opp-a');
    expect(content).toContain('opp-b');
  });
});
