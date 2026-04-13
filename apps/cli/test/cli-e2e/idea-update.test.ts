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

  it('byte-level round-trip: update --status leaves the body portion untouched', () => {
    // The M1-S4 adapter contract suite proves the parser preserves
    // section content byte-for-byte. This test proves the command layer
    // doesn't accidentally break that promise for a trivial
    // frontmatter-only update.
    //
    // Approach: create an idea, then hand-edit the file with awkward
    // content (parser-bait: fenced code with `##`, nested lists, inline
    // code in headings, trailing whitespace, mixed tabs in code). Then
    // run one body-replace via --body-file to push the crafted content
    // through the serializer, so the on-disk form is already in
    // canonical shape. Snapshot THAT as `before`. Running a
    // frontmatter-only update after it must leave the body portion
    // byte-for-byte identical — the load-bearing promise.
    const { dir: d2, cleanup: c2 } = makeTempProject();
    cleanups.push(c2);
    runCli(['init'], { cwd: d2 });
    runCli(['idea', 'create', '--name', 'Round Trip Test'], { cwd: d2 });

    const file = resolve(d2, '.etak/artifacts/ideas/round-trip-test.md');
    const crafted = [
      '## Description',
      '',
      'A block of prose first.  ',
      '',
      '```markdown',
      '## Not a real heading',
      'fenced code should survive untouched',
      '\tmixed\ttabs\tin\tcode',
      '```',
      '',
      'Trailing paragraph.',
      '',
      '## Why This Could Work',
      '',
      'With `etak init` we bootstrap the project.',
      '',
      '- top level item',
      '  - nested item with `inline code`',
      '  - nested item with **emphasis**',
      '- another top level',
      '  1. numbered child',
      '  2. another numbered child',
      '',
      '## Open Questions',
      '',
      'What about `--force-suffix`? And what if someone writes `##` inline?',
      '',
    ].join('\n');
    const bodyPath = resolve(d2, 'crafted-body.md');
    writeFileSync(bodyPath, crafted, 'utf8');
    runCli(['idea', 'update', 'round-trip-test', '--body-file', bodyPath], { cwd: d2 });

    const before = readFileSync(file, 'utf8');
    // Split at the closing frontmatter delimiter — everything after that
    // is the body portion we expect to preserve byte-for-byte.
    const bodyMarker = '\n---\n';
    const idxBefore = before.indexOf(bodyMarker, before.indexOf('---') + 3);
    const bodyBefore = before.slice(idxBefore + bodyMarker.length);

    const result = runCli(
      ['idea', 'update', 'round-trip-test', '--status', 'exploring'],
      { cwd: d2 },
    );
    expect(result.status).toBe(0);

    const after = readFileSync(file, 'utf8');
    const idxAfter = after.indexOf(bodyMarker, after.indexOf('---') + 3);
    const bodyAfter = after.slice(idxAfter + bodyMarker.length);

    // Strict string equality on the body portion — load-bearing promise.
    expect(bodyAfter).toBe(bodyBefore);
    // Frontmatter was updated.
    expect(after).toContain('status: exploring');
  });

  it('applies --status plus multiple --section flags in a single atomic update', () => {
    const file = resolve(dir, '.etak/artifacts/ideas/target-idea.md');
    const result = runCli(
      [
        'idea',
        'update',
        'target-idea',
        '--status',
        'exploring',
        '--section',
        'description=new description body',
        '--section',
        'why_this_could_work=new rationale body',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const data = env.data as { applied: string[] };
    // A single envelope carries all three applied labels.
    expect(data.applied).toContain('status');
    expect(data.applied).toContain('section:description');
    expect(data.applied).toContain('section:why_this_could_work');

    // Final file state reflects all three changes.
    const after = readFileSync(file, 'utf8');
    expect(after).toContain('status: exploring');
    expect(after).toContain('new description body');
    expect(after).toContain('new rationale body');
    // Frontmatter still intact.
    expect(after).toContain('name: Target Idea');
    expect(after).toContain('type: idea');
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
