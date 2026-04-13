// e2e for `etak idea get <slug>`. This is the first command that can
// reach exit code 2 — the M1-S5 chassis reserved it for M1-S6.

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak idea get (built binary e2e)', () => {
  beforeAll(() => assertBuiltBin());

  const cleanups: Array<() => void> = [];
  let dir = '';
  beforeEach(() => {
    const { dir: d, cleanup } = makeTempProject();
    dir = d;
    cleanups.push(cleanup);
    runCli(['init'], { cwd: dir });
  });
  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('returns the parsed Document for an existing idea', () => {
    runCli(['idea', 'create', '--name', 'Gettable'], { cwd: dir });
    const result = runCli(['idea', 'get', 'gettable'], { cwd: dir });
    expect(result.status).toBe(0);

    const env = parseEnvelope(result.stdout);
    expect(env.status).toBe('ok');
    expect(env.command).toBe('idea get');
    const data = env.data as {
      document: {
        ref: { type: string; slug: string };
        frontmatter: { name: string; type: string };
        body: { sections: Array<{ slug: string }> };
      };
    };
    expect(data.document.ref.slug).toBe('gettable');
    expect(data.document.frontmatter.name).toBe('Gettable');
    const sectionSlugs = data.document.body.sections.map((s) => s.slug);
    expect(sectionSlugs).toContain('description');
    expect(sectionSlugs).toContain('why_this_could_work');
  });

  it('exits 2 with E_NOT_FOUND when the slug does not exist', () => {
    const result = runCli(['idea', 'get', 'nope'], { cwd: dir });
    expect(result.status).toBe(2);
    const env = parseEnvelope(result.stderr);
    expect(env.status).toBe('error');
    expect(env.errors[0]?.code).toBe('E_NOT_FOUND');
    expect(env.errors[0]?.message).toMatch(/idea\/nope/);
  });

  it('surfaces drift warnings in the envelope for a hand-edited extra section', () => {
    runCli(['idea', 'create', '--name', 'WithExtra'], { cwd: dir });
    const file = resolve(dir, '.etak/artifacts/ideas/withextra.md');
    const withExtra = `---
name: WithExtra
type: idea
status: draft
addresses: []
delivered_by: []
---

## Description

d

## Why This Could Work

w

## Notes to Self

Extras live here.
`;
    writeFileSync(file, withExtra, 'utf8');

    const result = runCli(['idea', 'get', 'withextra'], { cwd: dir });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const extras = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'extra_section',
    );
    expect(extras.length).toBeGreaterThanOrEqual(1);

    // Extra section still present in the parsed body.
    const data = env.data as {
      document: { body: { sections: Array<{ heading: string }> } };
    };
    const headings = data.document.body.sections.map((s) => s.heading);
    expect(headings).toContain('Notes to Self');
  });

  it('human mode prints the name, slug, and section headings', () => {
    runCli(['idea', 'create', '--name', 'Humane Get'], { cwd: dir });
    const result = runCli(['--output', 'human', 'idea', 'get', 'humane-get'], {
      cwd: dir,
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Humane Get');
    expect(result.stdout).toContain('idea/humane-get');
    expect(result.stdout).toContain('## Description');
  });
});
