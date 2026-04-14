// e2e for `etak opportunity link <slug>`. Covers clean link, dangling link
// warning, unlink, unlink of a not-present link (warn not error), missing
// source slug (exit 2), and the no-op flag-free invocation.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak opportunity link (built binary e2e)', () => {
  beforeAll(() => assertBuiltBin());

  const cleanups: Array<() => void> = [];
  let dir = '';
  beforeEach(() => {
    const { dir: d, cleanup } = makeTempProject();
    dir = d;
    cleanups.push(cleanup);
    runCli(['init'], { cwd: dir });
    runCli(['opportunity', 'create', '--name', 'Source Opp'], { cwd: dir });
  });
  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('adds a link to an existing objective cleanly (no dangling warning)', () => {
    // Create an objective by hand so the adapter sees an existing ref.
    const objPath = resolve(
      dir,
      '.etak/artifacts/objectives/target-obj.md',
    );
    const yaml =
      '---\nname: Target Obj\ntype: objective\nstatus: active\n---\n\n## Description\n\nd\n\n## Success Criteria\n\ns\n';
    writeFileSync(objPath, yaml, 'utf8');

    const result = runCli(
      ['opportunity', 'link', 'source-opp', '--supports', 'target-obj'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const dangling = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'dangling_ref',
    );
    expect(dangling.length).toBe(0);

    const after = readFileSync(
      resolve(dir, '.etak/artifacts/opportunities/source-opp.md'),
      'utf8',
    );
    expect(after).toMatch(/target-obj/);
  });

  it('adds a dangling link and surfaces a warning (non-fatal)', () => {
    const result = runCli(
      ['opportunity', 'link', 'source-opp', '--supports', 'ghost-obj'],
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
    runCli(
      ['opportunity', 'link', 'source-opp', '--supports', 'obj-x'],
      { cwd: dir },
    );
    const result = runCli(
      ['opportunity', 'link', 'source-opp', '--remove-supports', 'obj-x'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const after = readFileSync(
      resolve(dir, '.etak/artifacts/opportunities/source-opp.md'),
      'utf8',
    );
    expect(after).not.toMatch(/obj-x/);
  });

  it('removing a link that was never present is a no-op with a warning', () => {
    const result = runCli(
      ['opportunity', 'link', 'source-opp', '--remove-supports', 'never-there'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const warns = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'link_not_present',
    );
    expect(warns.length).toBeGreaterThanOrEqual(1);
  });

  it('exits 2 when the source opportunity does not exist', () => {
    const result = runCli(
      ['opportunity', 'link', 'no-such-opp', '--supports', 'obj-x'],
      { cwd: dir },
    );
    expect(result.status).toBe(2);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_NOT_FOUND');
  });

  it('errors when no link operation flags are passed', () => {
    const result = runCli(['opportunity', 'link', 'source-opp'], { cwd: dir });
    expect(result.status).toBe(1);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_VALIDATION');
  });
});
