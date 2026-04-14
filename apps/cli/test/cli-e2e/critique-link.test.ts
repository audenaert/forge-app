// e2e coverage for `etak critique link`. Covers the mixed scalar/array
// link shape: `target` (scalar, replaces), `personas_used` and
// `frameworks_used` (free-form string arrays), `artifacts_created`
// (slug-valued array with dangling probes).

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak critique link (built binary e2e)', () => {
  beforeAll(() => assertBuiltBin());

  const cleanups: Array<() => void> = [];
  let dir = '';
  beforeEach(() => {
    const { dir: d, cleanup } = makeTempProject();
    dir = d;
    cleanups.push(cleanup);
    runCli(['init'], { cwd: dir });
    runCli(
      ['critique', 'create', '--name', 'Subject Critique', '--target', 'orig'],
      { cwd: dir },
    );
  });
  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('replaces the scalar --target (first scalar link exercised end-to-end)', () => {
    // Pre-create an idea so the new target resolves cleanly.
    runCli(['idea', 'create', '--name', 'Real'], { cwd: dir });
    const result = runCli(
      ['critique', 'link', 'subject-critique', '--target', 'real'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'dangling_ref',
    );
    expect(dangling.length).toBe(0);

    const after = readFileSync(
      resolve(dir, '.etak/artifacts/critiques/subject-critique.md'),
      'utf8',
    );
    expect(after).toContain('target: real');
    // Scalar replacement: the original target should be gone.
    expect(after).not.toContain('target: orig');
  });

  it('surfaces a dangling_ref warning when --target does not resolve', () => {
    const result = runCli(
      ['critique', 'link', 'subject-critique', '--target', 'ghost'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'dangling_ref',
    );
    expect(dangling.length).toBeGreaterThanOrEqual(1);
  });

  it('adds and removes a persona (string array)', () => {
    const add = runCli(
      [
        'critique',
        'link',
        'subject-critique',
        '--add-persona-used',
        'Skeptical researcher',
      ],
      { cwd: dir },
    );
    expect(add.status).toBe(0);
    let content = readFileSync(
      resolve(dir, '.etak/artifacts/critiques/subject-critique.md'),
      'utf8',
    );
    expect(content).toContain('Skeptical researcher');

    const remove = runCli(
      [
        'critique',
        'link',
        'subject-critique',
        '--remove-persona-used',
        'Skeptical researcher',
      ],
      { cwd: dir },
    );
    expect(remove.status).toBe(0);
    content = readFileSync(
      resolve(dir, '.etak/artifacts/critiques/subject-critique.md'),
      'utf8',
    );
    expect(content).not.toContain('Skeptical researcher');
  });

  it('adds a framework without emitting a spurious dangling_ref warning', () => {
    // frameworks_used is free-form strings, not slugs — so the adapter's
    // dangling probe must be bypassed (the critique/link handler mutates
    // frontmatter directly for string arrays).
    const result = runCli(
      [
        'critique',
        'link',
        'subject-critique',
        '--add-framework-used',
        'Pre-mortem',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'dangling_ref',
    );
    expect(dangling.length).toBe(0);
  });

  it('dangles artifacts_created when the slug does not resolve', () => {
    const result = runCli(
      [
        'critique',
        'link',
        'subject-critique',
        '--add-artifact-created',
        'missing-assumption',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'dangling_ref',
    );
    expect(dangling.length).toBeGreaterThanOrEqual(1);
  });

  it('links artifacts_created cleanly when the slug resolves', () => {
    // Seed a fake assumption file so the slug resolves.
    const assumptionPath = resolve(
      dir,
      '.etak/artifacts/assumptions/seeded.md',
    );
    writeFileSync(
      assumptionPath,
      '---\nname: Seeded\ntype: assumption\nstatus: open\n---\n\n## Statement\n\nx\n',
      'utf8',
    );
    const result = runCli(
      [
        'critique',
        'link',
        'subject-critique',
        '--add-artifact-created',
        'seeded',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'dangling_ref',
    );
    expect(dangling.length).toBe(0);
  });

  it('remove of a not-present artifact_created is a no-op with warning', () => {
    const result = runCli(
      [
        'critique',
        'link',
        'subject-critique',
        '--remove-artifact-created',
        'never-there',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const warns = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'link_not_present',
    );
    expect(warns.length).toBeGreaterThanOrEqual(1);
  });

  it('exits 2 when the source critique does not exist', () => {
    const result = runCli(
      ['critique', 'link', 'no-such', '--target', 'x'],
      { cwd: dir },
    );
    expect(result.status).toBe(2);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_NOT_FOUND');
  });

  it('errors when no link operation flags are passed', () => {
    const result = runCli(['critique', 'link', 'subject-critique'], {
      cwd: dir,
    });
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
  });
});
