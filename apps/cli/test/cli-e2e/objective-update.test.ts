// e2e for `etak objective update <slug>`. Mirrors idea-update.test.ts
// with objective-specific field set (no --add-* / --remove-* link
// flags) and includes a byte-level round-trip against the real
// fixture `grow-etak-via-local-first-plg.md`.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  pkgRoot,
  runCli,
} from './helpers.js';

describe('etak objective update (built binary e2e)', () => {
  beforeAll(() => assertBuiltBin());

  const cleanups: Array<() => void> = [];
  let dir = '';
  beforeEach(() => {
    const { dir: d, cleanup } = makeTempProject();
    dir = d;
    cleanups.push(cleanup);
    runCli(['init'], { cwd: dir });
    runCli(['objective', 'create', '--name', 'Target Objective'], { cwd: dir });
  });
  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('updates --status and leaves the body untouched', () => {
    const before = readFileSync(
      resolve(dir, '.etak/artifacts/objectives/target-objective.md'),
      'utf8',
    );
    const result = runCli(
      ['objective', 'update', 'target-objective', '--status', 'paused'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect((env.data as { applied: string[] }).applied).toContain('status');

    const after = readFileSync(
      resolve(dir, '.etak/artifacts/objectives/target-objective.md'),
      'utf8',
    );
    expect(after).toContain('status: paused');
    expect(after).toContain('## Description');
    expect(after).toContain('## Success Criteria');
    // Same number of section headings.
    expect(after.split('## ').length).toBe(before.split('## ').length);
  });

  it('updates --name', () => {
    const result = runCli(
      ['objective', 'update', 'target-objective', '--name', 'Renamed'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect((env.data as { applied: string[] }).applied).toContain('name');
    const after = readFileSync(
      resolve(dir, '.etak/artifacts/objectives/target-objective.md'),
      'utf8',
    );
    expect(after).toContain('name: Renamed');
  });

  it('--section slug=content replaces one section only', () => {
    runCli(
      [
        'objective',
        'update',
        'target-objective',
        '--section',
        'description=New description body.',
      ],
      { cwd: dir },
    );
    const content = readFileSync(
      resolve(dir, '.etak/artifacts/objectives/target-objective.md'),
      'utf8',
    );
    expect(content).toContain('New description body.');
    expect(content).toContain('## Success Criteria');
  });

  it('--body-file replaces the whole body, frontmatter preserved', () => {
    const replacement =
      '## Description\n\nReplaced description.\n\n## Success Criteria\n\nReplaced criteria.\n';
    const path = resolve(dir, 'new-body.md');
    writeFileSync(path, replacement, 'utf8');

    const result = runCli(
      ['objective', 'update', 'target-objective', '--body-file', path],
      { cwd: dir },
    );
    expect(result.status).toBe(0);

    const content = readFileSync(
      resolve(dir, '.etak/artifacts/objectives/target-objective.md'),
      'utf8',
    );
    expect(content).toContain('name: Target Objective');
    expect(content).toContain('type: objective');
    expect(content).toContain('Replaced description.');
    expect(content).toContain('Replaced criteria.');
  });

  it('exits 2 when updating a slug that does not exist', () => {
    const result = runCli(
      ['objective', 'update', 'nope', '--status', 'paused'],
      { cwd: dir },
    );
    expect(result.status).toBe(2);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_NOT_FOUND');
  });

  it('exits 1 when --status is an invalid enum value', () => {
    const result = runCli(
      ['objective', 'update', 'target-objective', '--status', 'wat'],
      { cwd: dir },
    );
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
  });

  it('rejects --section mixed with --body (mutually exclusive forms)', () => {
    const result = runCli(
      [
        'objective',
        'update',
        'target-objective',
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

  it('rejects an update with no flags at all', () => {
    const result = runCli(['objective', 'update', 'target-objective'], {
      cwd: dir,
    });
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
    expect(env.errors[0]?.message).toMatch(/no updates specified/);
  });

  it('applies --status plus multiple --section flags in a single atomic update', () => {
    const file = resolve(dir, '.etak/artifacts/objectives/target-objective.md');
    const result = runCli(
      [
        'objective',
        'update',
        'target-objective',
        '--status',
        'paused',
        '--section',
        'description=new description body',
        '--section',
        'success_criteria=new criteria body',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const data = env.data as { applied: string[] };
    expect(data.applied).toContain('status');
    expect(data.applied).toContain('section:description');
    expect(data.applied).toContain('section:success_criteria');

    const after = readFileSync(file, 'utf8');
    expect(after).toContain('status: paused');
    expect(after).toContain('new description body');
    expect(after).toContain('new criteria body');
    expect(after).toContain('name: Target Objective');
    expect(after).toContain('type: objective');
  });

  it('drift: extra section is preserved across an update', () => {
    const file = resolve(dir, '.etak/artifacts/objectives/target-objective.md');
    const withExtra = `---
name: Target Objective
type: objective
status: active
---

## Description

d

## Success Criteria

s

## Notes

Human added this.
`;
    writeFileSync(file, withExtra, 'utf8');

    const result = runCli(
      ['objective', 'update', 'target-objective', '--status', 'paused'],
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
    const file = resolve(dir, '.etak/artifacts/objectives/target-objective.md');
    const dropped = `---
name: Target Objective
type: objective
status: active
---

## Description

only description
`;
    writeFileSync(file, dropped, 'utf8');

    const result = runCli(
      ['objective', 'update', 'target-objective', '--status', 'paused'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const missing = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'missing_required_section',
    );
    expect(missing.length).toBeGreaterThanOrEqual(1);
  });

  it('real-fixture byte-level round-trip: --status update leaves body portion byte-identical', () => {
    // The highest-stakes fidelity check: a human-authored objective
    // (live fixture under docs/discovery/objectives) must pass through a
    // status-only update with its body portion byte-for-byte preserved.
    //
    // Approach mirrors idea-update's round-trip test: drop the fixture
    // into the temp project, then issue a body-replace with the fixture's
    // exact post-frontmatter body so the on-disk form is in canonical
    // shape. Snapshot that as `before`. A subsequent status-only update
    // must not touch a single byte of the body portion.
    const { dir: d2, cleanup: c2 } = makeTempProject();
    cleanups.push(c2);
    runCli(['init'], { cwd: d2 });

    const fixturePath = resolve(
      pkgRoot,
      '..',
      '..',
      'docs',
      'discovery',
      'objectives',
      'grow-etak-via-local-first-plg.md',
    );
    const fixture = readFileSync(fixturePath, 'utf8');
    const file = resolve(
      d2,
      '.etak/artifacts/objectives/grow-etak-via-local-first-plg.md',
    );
    writeFileSync(file, fixture, 'utf8');

    // Normalize by pushing the body through the serializer once: extract
    // the body portion from the fixture and run it through --body-file.
    // That gives us a canonical on-disk form to compare against.
    const bodyMarker = '\n---\n';
    const fixtureBodyStart =
      fixture.indexOf(bodyMarker, fixture.indexOf('---') + 3) +
      bodyMarker.length;
    const fixtureBody = fixture.slice(fixtureBodyStart);
    const bodyPath = resolve(d2, 'canonical-body.md');
    writeFileSync(bodyPath, fixtureBody, 'utf8');
    runCli(
      [
        'objective',
        'update',
        'grow-etak-via-local-first-plg',
        '--body-file',
        bodyPath,
      ],
      { cwd: d2 },
    );

    const before = readFileSync(file, 'utf8');
    const idxBefore = before.indexOf(bodyMarker, before.indexOf('---') + 3);
    const bodyBefore = before.slice(idxBefore + bodyMarker.length);

    const result = runCli(
      [
        'objective',
        'update',
        'grow-etak-via-local-first-plg',
        '--status',
        'paused',
      ],
      { cwd: d2 },
    );
    expect(result.status).toBe(0);

    const after = readFileSync(file, 'utf8');
    const idxAfter = after.indexOf(bodyMarker, after.indexOf('---') + 3);
    const bodyAfter = after.slice(idxAfter + bodyMarker.length);

    // Strict string equality on the body portion — load-bearing promise.
    expect(bodyAfter).toBe(bodyBefore);
    // Frontmatter was updated.
    expect(after).toContain('status: paused');
  });
});
