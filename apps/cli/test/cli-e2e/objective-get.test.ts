// e2e for `etak objective get <slug>`. Mirrors idea-get.test.ts.

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak objective get (built binary e2e)', () => {
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

  it('returns the parsed Document for an existing objective', () => {
    runCli(['objective', 'create', '--name', 'Gettable'], { cwd: dir });
    const result = runCli(['objective', 'get', 'gettable'], { cwd: dir });
    expect(result.status).toBe(0);

    const env = parseEnvelope(result.stdout);
    expect(env.status).toBe('ok');
    expect(env.command).toBe('objective get');
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
    expect(sectionSlugs).toContain('context');
    expect(sectionSlugs).toContain('success_criteria');
    expect(sectionSlugs).toContain('out_of_scope');
  });

  it('exits 2 with E_NOT_FOUND when the slug does not exist', () => {
    const result = runCli(['objective', 'get', 'nope'], { cwd: dir });
    expect(result.status).toBe(2);
    const env = parseEnvelope(result.stderr);
    expect(env.status).toBe('error');
    expect(env.errors[0]?.code).toBe('E_NOT_FOUND');
    expect(env.errors[0]?.message).toMatch(/objective\/nope/);
  });

  it('surfaces drift warnings in the envelope for a hand-edited extra section', () => {
    runCli(['objective', 'create', '--name', 'WithExtra'], { cwd: dir });
    const file = resolve(dir, '.etak/artifacts/objectives/withextra.md');
    const withExtra = `---
name: WithExtra
type: objective
status: active
---

## Description

d

## Success Criteria

s

## Notes to Self

Extras live here.
`;
    writeFileSync(file, withExtra, 'utf8');

    const result = runCli(['objective', 'get', 'withextra'], { cwd: dir });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    const extras = (env.warnings as Array<{ kind: string }>).filter(
      (w) => w.kind === 'extra_section',
    );
    expect(extras.length).toBeGreaterThanOrEqual(1);

    const data = env.data as {
      document: { body: { sections: Array<{ heading: string }> } };
    };
    const headings = data.document.body.sections.map((s) => s.heading);
    expect(headings).toContain('Notes to Self');
  });

  it('human mode prints the name, slug, and section headings', () => {
    runCli(['objective', 'create', '--name', 'Humane Get'], { cwd: dir });
    const result = runCli(
      ['--output', 'human', 'objective', 'get', 'humane-get'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Humane Get');
    expect(result.stdout).toContain('objective/humane-get');
    expect(result.stdout).toContain('## Description');
  });
});
