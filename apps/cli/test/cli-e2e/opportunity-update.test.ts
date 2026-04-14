// e2e for `etak opportunity update <slug>`. Covers frontmatter updates
// (status, name, hmw, supports add/remove), section replace, body replace,
// atomic multi-op, missing-slug (exit 2), invalid status (exit 1),
// mutually-exclusive body forms, and a byte-level round-trip through the
// real fixture that preserves the `hmw` passthrough value.

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

describe('etak opportunity update (built binary e2e)', () => {
  beforeAll(() => assertBuiltBin());

  const cleanups: Array<() => void> = [];
  let dir = '';
  beforeEach(() => {
    const { dir: d, cleanup } = makeTempProject();
    dir = d;
    cleanups.push(cleanup);
    runCli(['init'], { cwd: dir });
    runCli(
      [
        'opportunity',
        'create',
        '--name',
        'Target Opp',
        '--hmw',
        'HMW target?',
      ],
      { cwd: dir },
    );
  });
  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('updates --status and leaves the body untouched', () => {
    const before = readFileSync(
      resolve(dir, '.etak/artifacts/opportunities/target-opp.md'),
      'utf8',
    );
    const result = runCli(
      ['opportunity', 'update', 'target-opp', '--status', 'paused'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect((env.data as { applied: string[] }).applied).toContain('status');

    const after = readFileSync(
      resolve(dir, '.etak/artifacts/opportunities/target-opp.md'),
      'utf8',
    );
    expect(after).toContain('status: paused');
    expect(after).toContain('## Description');
    expect(after).toContain('## Evidence');
    // Same number of section headings.
    expect(after.split('## ').length).toBe(before.split('## ').length);
    // hmw preserved.
    expect(after).toContain('HMW target?');
  });

  it('updates --name', () => {
    const result = runCli(
      ['opportunity', 'update', 'target-opp', '--name', 'Renamed'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect((env.data as { applied: string[] }).applied).toContain('name');
    const after = readFileSync(
      resolve(dir, '.etak/artifacts/opportunities/target-opp.md'),
      'utf8',
    );
    expect(after).toContain('name: Renamed');
  });

  it('updates --hmw to a new value', () => {
    const result = runCli(
      ['opportunity', 'update', 'target-opp', '--hmw', 'HMW updated?'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect((env.data as { applied: string[] }).applied).toContain('hmw');
    const after = readFileSync(
      resolve(dir, '.etak/artifacts/opportunities/target-opp.md'),
      'utf8',
    );
    expect(after).toContain('HMW updated?');
    expect(after).not.toContain('HMW target?');
  });

  it('--section slug=content replaces one section only', () => {
    runCli(
      [
        'opportunity',
        'update',
        'target-opp',
        '--section',
        'description=New description body.',
      ],
      { cwd: dir },
    );
    const content = readFileSync(
      resolve(dir, '.etak/artifacts/opportunities/target-opp.md'),
      'utf8',
    );
    expect(content).toContain('New description body.');
    expect(content).toContain('## Evidence');
  });

  it('--body-file replaces the whole body, frontmatter preserved', () => {
    const replacement =
      '## Description\n\nReplaced description.\n\n## Evidence\n\nReplaced evidence.\n';
    const path = resolve(dir, 'new-body.md');
    writeFileSync(path, replacement, 'utf8');

    const result = runCli(
      ['opportunity', 'update', 'target-opp', '--body-file', path],
      { cwd: dir },
    );
    expect(result.status).toBe(0);

    const content = readFileSync(
      resolve(dir, '.etak/artifacts/opportunities/target-opp.md'),
      'utf8',
    );
    expect(content).toContain('name: Target Opp');
    expect(content).toContain('type: opportunity');
    expect(content).toContain('Replaced description.');
    expect(content).toContain('Replaced evidence.');
    // hmw preserved across a body-replace.
    expect(content).toContain('HMW target?');
  });

  it('exits 2 when updating a slug that does not exist', () => {
    const result = runCli(
      ['opportunity', 'update', 'nope', '--status', 'paused'],
      { cwd: dir },
    );
    expect(result.status).toBe(2);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_NOT_FOUND');
  });

  it('exits 1 when --status is an invalid enum value', () => {
    const result = runCli(
      ['opportunity', 'update', 'target-opp', '--status', 'wat'],
      { cwd: dir },
    );
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
  });

  it('rejects --section mixed with --body (mutually exclusive)', () => {
    const result = runCli(
      [
        'opportunity',
        'update',
        'target-opp',
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
    const result = runCli(['opportunity', 'update', 'target-opp'], { cwd: dir });
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
    expect(env.errors[0]?.message).toMatch(/no updates specified/);
  });

  it('applies --status + --hmw + multiple --section flags atomically', () => {
    const file = resolve(dir, '.etak/artifacts/opportunities/target-opp.md');
    const result = runCli(
      [
        'opportunity',
        'update',
        'target-opp',
        '--status',
        'paused',
        '--hmw',
        'HMW three?',
        '--section',
        'description=new description body',
        '--section',
        'evidence=new evidence body',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const data = env.data as { applied: string[] };
    expect(data.applied).toContain('status');
    expect(data.applied).toContain('hmw');
    expect(data.applied).toContain('section:description');
    expect(data.applied).toContain('section:evidence');

    const after = readFileSync(file, 'utf8');
    expect(after).toContain('status: paused');
    expect(after).toContain('HMW three?');
    expect(after).toContain('new description body');
    expect(after).toContain('new evidence body');
  });

  it('adds and removes supports via --add-supports / --remove-supports', () => {
    runCli(
      [
        'opportunity',
        'update',
        'target-opp',
        '--add-supports',
        'obj-a',
        '--add-supports',
        'obj-b',
      ],
      { cwd: dir },
    );
    let content = readFileSync(
      resolve(dir, '.etak/artifacts/opportunities/target-opp.md'),
      'utf8',
    );
    expect(content).toContain('obj-a');
    expect(content).toContain('obj-b');

    runCli(
      ['opportunity', 'update', 'target-opp', '--remove-supports', 'obj-a'],
      { cwd: dir },
    );
    content = readFileSync(
      resolve(dir, '.etak/artifacts/opportunities/target-opp.md'),
      'utf8',
    );
    expect(content).not.toContain('obj-a');
    expect(content).toContain('obj-b');
  });

  it('real-fixture byte-level round-trip: --status update preserves body and hmw', () => {
    // The highest-stakes fidelity check: the live fixture — including
    // its `hmw` passthrough — must pass through a status-only update
    // with the body portion byte-for-byte preserved and `hmw` intact.
    const { dir: d2, cleanup: c2 } = makeTempProject();
    cleanups.push(c2);
    runCli(['init'], { cwd: d2 });

    const fixturePath = resolve(
      pkgRoot,
      '..',
      '..',
      'docs',
      'discovery',
      'opportunities',
      'solo-devs-blocked-by-team-tool-overhead.md',
    );
    const fixture = readFileSync(fixturePath, 'utf8');
    const file = resolve(
      d2,
      '.etak/artifacts/opportunities/solo-devs-blocked-by-team-tool-overhead.md',
    );
    writeFileSync(file, fixture, 'utf8');

    // Normalize: push the body portion through --body-file so the on-disk
    // form is in canonical shape.
    const bodyMarker = '\n---\n';
    const fixtureBodyStart =
      fixture.indexOf(bodyMarker, fixture.indexOf('---') + 3) +
      bodyMarker.length;
    const fixtureBody = fixture.slice(fixtureBodyStart);
    const bodyPath = resolve(d2, 'canonical-body.md');
    writeFileSync(bodyPath, fixtureBody, 'utf8');
    runCli(
      [
        'opportunity',
        'update',
        'solo-devs-blocked-by-team-tool-overhead',
        '--body-file',
        bodyPath,
      ],
      { cwd: d2 },
    );

    const before = readFileSync(file, 'utf8');
    const idxBefore = before.indexOf(bodyMarker, before.indexOf('---') + 3);
    const bodyBefore = before.slice(idxBefore + bodyMarker.length);
    // Capture the exact hmw line from `before`.
    const hmwMatch = before.match(/^hmw:.*$/m);
    expect(hmwMatch).not.toBeNull();
    const hmwLine = hmwMatch![0];

    const result = runCli(
      [
        'opportunity',
        'update',
        'solo-devs-blocked-by-team-tool-overhead',
        '--status',
        'paused',
      ],
      { cwd: d2 },
    );
    expect(result.status).toBe(0);

    const after = readFileSync(file, 'utf8');
    const idxAfter = after.indexOf(bodyMarker, after.indexOf('---') + 3);
    const bodyAfter = after.slice(idxAfter + bodyMarker.length);

    // Body portion byte-identical.
    expect(bodyAfter).toBe(bodyBefore);
    // Frontmatter updated.
    expect(after).toContain('status: paused');
    // hmw preserved byte-identically (line-level check).
    expect(after).toContain(hmwLine);
  });

  it('real-fixture update --hmw changes just the hmw value', () => {
    const { dir: d2, cleanup: c2 } = makeTempProject();
    cleanups.push(c2);
    runCli(['init'], { cwd: d2 });

    const fixturePath = resolve(
      pkgRoot,
      '..',
      '..',
      'docs',
      'discovery',
      'opportunities',
      'solo-devs-blocked-by-team-tool-overhead.md',
    );
    const fixture = readFileSync(fixturePath, 'utf8');
    const file = resolve(
      d2,
      '.etak/artifacts/opportunities/solo-devs-blocked-by-team-tool-overhead.md',
    );
    writeFileSync(file, fixture, 'utf8');

    const result = runCli(
      [
        'opportunity',
        'update',
        'solo-devs-blocked-by-team-tool-overhead',
        '--hmw',
        'HMW rewritten question?',
      ],
      { cwd: d2 },
    );
    expect(result.status).toBe(0);

    const after = readFileSync(file, 'utf8');
    expect(after).toContain('HMW rewritten question?');
    expect(after).not.toContain(
      'HMW let a solo developer start getting value from Etak',
    );
  });
});
