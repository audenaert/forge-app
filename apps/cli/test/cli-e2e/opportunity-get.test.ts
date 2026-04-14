// e2e for `etak opportunity get <slug>`. Covers happy path, missing slug
// (exit 2), drift warning surfacing, and the `hmw` rendering in human mode.

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak opportunity get (built binary e2e)', () => {
  beforeAll(() => assertBuiltBin());

  const cleanups: Array<() => void> = [];
  let dir = '';
  beforeEach(() => {
    const { dir: d, cleanup } = makeTempProject();
    dir = d;
    cleanups.push(cleanup);
    runCli(['init'], { cwd: dir });
    runCli(
      ['opportunity', 'create', '--name', 'Target Opp', '--hmw', 'HMW win?'],
      { cwd: dir },
    );
  });
  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('returns the parsed document on happy path', () => {
    const result = runCli(['opportunity', 'get', 'target-opp'], { cwd: dir });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect(env.command).toBe('opportunity get');
    const data = env.data as {
      document: {
        ref: { type: string; slug: string };
        frontmatter: { name: string; status: string; hmw?: unknown };
      };
    };
    expect(data.document.ref).toEqual({
      type: 'opportunity',
      slug: 'target-opp',
    });
    expect(data.document.frontmatter.name).toBe('Target Opp');
    expect(data.document.frontmatter.hmw).toBe('HMW win?');
  });

  it('exits 2 when the slug does not exist', () => {
    const result = runCli(['opportunity', 'get', 'no-such-opp'], { cwd: dir });
    expect(result.status).toBe(2);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_NOT_FOUND');
  });

  it('surfaces a missing_required_section warning when a required section is missing', () => {
    // Hand-write a file with only Description — Evidence is required.
    const file = resolve(dir, '.etak/artifacts/opportunities/partial.md');
    writeFileSync(
      file,
      '---\nname: Partial\ntype: opportunity\nstatus: active\n---\n\n## Description\n\nonly d\n',
      'utf8',
    );
    const result = runCli(['opportunity', 'get', 'partial'], { cwd: dir });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const missing = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'missing_required_section',
    );
    expect(missing.length).toBeGreaterThanOrEqual(1);
  });

  it('human mode renders hmw, supports, and section headings', () => {
    const result = runCli(
      ['--output', 'human', 'opportunity', 'get', 'target-opp'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Target Opp (opportunity/target-opp)');
    expect(result.stdout).toContain('status: active');
    expect(result.stdout).toContain('hmw: HMW win?');
    expect(result.stdout).toContain('## Description');
    expect(result.stdout).toContain('## Evidence');
  });
});
