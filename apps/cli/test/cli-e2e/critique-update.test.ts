// e2e coverage for `etak critique update`.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak critique update (built binary e2e)', () => {
  beforeAll(() => assertBuiltBin());

  const cleanups: Array<() => void> = [];
  let dir = '';
  beforeEach(() => {
    const { dir: d, cleanup } = makeTempProject();
    dir = d;
    cleanups.push(cleanup);
    runCli(['init'], { cwd: dir });
    runCli(
      ['critique', 'create', '--name', 'Critique One', '--target', 'thing'],
      { cwd: dir },
    );
  });
  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('renames via --name', () => {
    const result = runCli(
      ['critique', 'update', 'critique-one', '--name', 'Renamed'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const content = readFileSync(
      resolve(dir, '.etak/artifacts/critiques/critique-one.md'),
      'utf8',
    );
    expect(content).toContain('name: Renamed');
  });

  it('replaces --target (scalar link)', () => {
    const result = runCli(
      ['critique', 'update', 'critique-one', '--target', 'new-target'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const content = readFileSync(
      resolve(dir, '.etak/artifacts/critiques/critique-one.md'),
      'utf8',
    );
    expect(content).toContain('target: new-target');
    expect(content).not.toContain('target: thing');
  });

  it('replaces body via --body', () => {
    const result = runCli(
      ['critique', 'update', 'critique-one', '--body', 'New opaque content here.'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const content = readFileSync(
      resolve(dir, '.etak/artifacts/critiques/critique-one.md'),
      'utf8',
    );
    expect(content).toContain('New opaque content here.');
    expect(content).not.toContain('_TODO: write critique content_');
  });

  it('replaces body via --body-file', () => {
    const path = resolve(dir, 'body.md');
    writeFileSync(path, 'File-sourced critique prose.\n\n- item\n', 'utf8');
    const result = runCli(
      ['critique', 'update', 'critique-one', '--body-file', path],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const content = readFileSync(
      resolve(dir, '.etak/artifacts/critiques/critique-one.md'),
      'utf8',
    );
    expect(content).toContain('File-sourced critique prose.');
    expect(content).toContain('- item');
  });

  it('rejects --section as an unknown option (exit 4, body-as-opaque canary)', () => {
    const result = runCli(
      ['critique', 'update', 'critique-one', '--section', 'foo=bar'],
      { cwd: dir },
    );
    expect(result.status).toBe(4);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_USAGE');
    expect(env.errors[0]?.message).toMatch(/unknown option.*--section/);
  });

  it('rejects --status as an unknown option (exit 4, statusless canary)', () => {
    const result = runCli(
      ['critique', 'update', 'critique-one', '--status', 'active'],
      { cwd: dir },
    );
    expect(result.status).toBe(4);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_USAGE');
    expect(env.errors[0]?.message).toMatch(/unknown option.*--status/);
  });

  it('rejects multiple --body* forms at once', () => {
    const result = runCli(
      ['critique', 'update', 'critique-one', '--body', 'x', '--body-stdin'],
      { cwd: dir },
    );
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
  });

  it('errors when no update flags are given', () => {
    const result = runCli(['critique', 'update', 'critique-one'], {
      cwd: dir,
    });
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
  });

  it('exits 2 on an unknown critique slug', () => {
    const result = runCli(
      ['critique', 'update', 'no-such', '--name', 'X'],
      { cwd: dir },
    );
    expect(result.status).toBe(2);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_NOT_FOUND');
  });

  it('round-trips a real fixture: body content preserved across update', () => {
    // Synthesize a realistic critique fixture directly into the project
    // and then run `update --name` against it. The test asserts that
    // every line of the original body reappears after the update —
    // that's the body-as-opaque round-trip promise.
    const critiqueDir = resolve(dir, '.etak/artifacts/critiques');
    mkdirSync(critiqueDir, { recursive: true });
    const original =
      '---\n' +
      'name: "Critique of Something"\n' +
      'type: critique\n' +
      'target: some-idea-slug\n' +
      'personas_used:\n' +
      '  - "Skeptical engineer"\n' +
      'frameworks_used:\n' +
      '  - "Pre-mortem"\n' +
      'date: "2026-04-10"\n' +
      'artifacts_created: []\n' +
      '---\n' +
      '\n' +
      'Some prose critique content with **formatting** and a list:\n' +
      '\n' +
      '- point one\n' +
      '- point two\n';
    const fixturePath = resolve(critiqueDir, 'round-trip-fixture.md');
    writeFileSync(fixturePath, original, 'utf8');

    const result = runCli(
      [
        'critique',
        'update',
        'round-trip-fixture',
        '--name',
        'Renamed Critique',
      ],
      { cwd: dir },
    );
    expect(result.status).toBe(0);

    const after = readFileSync(fixturePath, 'utf8');
    // Name updated.
    expect(after).toContain('name: Renamed Critique');
    // Other frontmatter preserved.
    expect(after).toContain('target: some-idea-slug');
    expect(after).toContain('Skeptical engineer');
    expect(after).toContain('Pre-mortem');
    // YAML serializer re-emits the date scalar unquoted on round-trip.
    expect(after).toMatch(/date:\s*['"]?2026-04-10['"]?/);
    // Body content preserved verbatim — every line of the original
    // body survives the round-trip through the opaque-body path.
    expect(after).toContain('Some prose critique content with **formatting** and a list:');
    expect(after).toContain('- point one');
    expect(after).toContain('- point two');
  });
});
