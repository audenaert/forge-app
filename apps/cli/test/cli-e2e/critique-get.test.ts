// e2e coverage for `etak critique get`.

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak critique get (built binary e2e)', () => {
  beforeAll(() => assertBuiltBin());

  const cleanups: Array<() => void> = [];
  let dir = '';
  beforeEach(() => {
    const { dir: d, cleanup } = makeTempProject();
    dir = d;
    cleanups.push(cleanup);
    runCli(['init'], { cwd: dir });
    runCli(
      ['critique', 'create', '--name', 'Readable Critique', '--target', 'thing'],
      { cwd: dir },
    );
  });
  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.();
  });

  it('returns the full document in JSON mode', () => {
    const result = runCli(['critique', 'get', 'readable-critique'], {
      cwd: dir,
    });
    expect(result.status).toBe(0);
    const env = parseEnvelope(result.stdout);
    expect(env.status).toBe('ok');
    const data = env.data as {
      document: {
        frontmatter: { name: string; type: string; target: string; status?: unknown };
        body: { sections: Array<{ heading: string; slug: string; status: string }> };
      };
    };
    expect(data.document.frontmatter.name).toBe('Readable Critique');
    expect(data.document.frontmatter.type).toBe('critique');
    expect(data.document.frontmatter.target).toBe('thing');
    // Statusless: no `status` key on the parsed frontmatter.
    expect(data.document.frontmatter.status).toBeUndefined();
    // Opaque body: exactly one headless section.
    expect(data.document.body.sections).toHaveLength(1);
    expect(data.document.body.sections[0]?.heading).toBe('');
    expect(data.document.body.sections[0]?.slug).toBe('body');
  });

  it('exits 2 when the slug does not exist', () => {
    const result = runCli(['critique', 'get', 'no-such-critique'], {
      cwd: dir,
    });
    expect(result.status).toBe(2);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_NOT_FOUND');
  });

  it('human-mode rendering contains no ## section headings (opaque body)', () => {
    const result = runCli(
      ['--output', 'human', 'critique', 'get', 'readable-critique'],
      { cwd: dir },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Readable Critique');
    expect(result.stdout).toContain('target: thing');
    // Opaque body: no canonical H2 headings — the whole body is
    // rendered as prose.
    expect(result.stdout).not.toMatch(/^## /m);
    // The scaffolded placeholder is printed verbatim.
    expect(result.stdout).toContain('_TODO: write critique content_');
  });
});
