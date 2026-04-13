// e2e for `etak idea link <slug>`. Covers: clean link, dangling link
// warning, unlink, unlink of a not-present link (warn not error),
// missing source slug (exit 2).

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak idea link (built binary e2e)', () => {
  beforeAll(() => assertBuiltBin());

  const cleanups: Array<() => void> = [];
  let dir = '';
  beforeEach(() => {
    const { dir: d, cleanup } = makeTempProject();
    dir = d;
    cleanups.push(cleanup);
    runCli(['init'], { cwd: dir });
    runCli(['idea', 'create', '--name', 'Source Idea'], { cwd: dir });
  });
  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('adds a link to an existing opportunity cleanly (no dangling warning)', () => {
    // Create an opportunity artifact by hand — `etak opportunity create` is
    // still an M2 stub. We write the file directly so the adapter sees it
    // as an existing ref.
    const oppPath = resolve(
      dir,
      '.etak/artifacts/opportunities/target-opp.md',
    );
    const yaml =
      '---\nname: Target Opp\ntype: opportunity\nstatus: active\n---\n\n## Description\n\nd\n\n## Evidence\n\ne\n';
    writeFileSync(oppPath, yaml, 'utf8');

    const result = runCli(
      ['idea', 'link', 'source-idea', '--addresses', 'target-opp'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'dangling_ref',
    );
    expect(dangling.length).toBe(0);

    const after = readFileSync(
      resolve(dir, '.etak/artifacts/ideas/source-idea.md'),
      'utf8',
    );
    expect(after).toMatch(/target-opp/);
  });

  it('adds a dangling link and surfaces a warning (non-fatal)', () => {
    const result = runCli(
      ['idea', 'link', 'source-idea', '--addresses', 'ghost-opp'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'dangling_ref',
    );
    expect(dangling.length).toBeGreaterThanOrEqual(1);
  });

  it('removes an existing link', () => {
    // Seed the link first.
    runCli(
      ['idea', 'link', 'source-idea', '--addresses', 'opp-x'],
      { cwd: dir },
    );
    const result = runCli(
      ['idea', 'link', 'source-idea', '--remove-addresses', 'opp-x'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const after = readFileSync(
      resolve(dir, '.etak/artifacts/ideas/source-idea.md'),
      'utf8',
    );
    expect(after).not.toMatch(/opp-x/);
  });

  it('removing a link that was never present is a no-op with a warning', () => {
    const result = runCli(
      ['idea', 'link', 'source-idea', '--remove-addresses', 'never-there'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const warns = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'link_not_present',
    );
    expect(warns.length).toBeGreaterThanOrEqual(1);
  });

  it('exits 2 when the source idea does not exist', () => {
    const result = runCli(
      ['idea', 'link', 'no-such-idea', '--addresses', 'opp-x'],
      { cwd: dir },
    );
    expect(result.status).toBe(2);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_NOT_FOUND');
  });

  it('errors when no link operation flags are passed', () => {
    const result = runCli(['idea', 'link', 'source-idea'], { cwd: dir });
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
  });
});
