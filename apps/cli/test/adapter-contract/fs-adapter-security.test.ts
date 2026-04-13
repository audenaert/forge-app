// Security tests for FsAdapter.
//
// Two layers of defense:
//   1. Input validation at every public adapter entry — SlugSchema rejects
//      slugs with `..`, `/`, or anything not kebab-case, raising
//      ValidationError (exit 1).
//   2. Defense-in-depth `assertUnderRoot` in paths.ts — any resolved path
//      that escapes the artifact root raises AdapterError (exit 3).
//
// These tests exercise layer 1 through every public method plus a direct
// unit test on `assertUnderRoot` for layer 2.

import { mkdtemp, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { FsAdapter, ValidationError, AdapterError } from '../../src/index.js';
import type { Document } from '../../src/index.js';
import { assertUnderRoot } from '../../src/adapters/fs/paths.js';

describe('FsAdapter path-traversal defense', () => {
  let root: string;
  let adapter: FsAdapter;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'etak-fs-security-'));
    adapter = new FsAdapter({ root });
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  // A deliberately-nasty slug that, naively resolved, escapes the artifact
  // root. We include a variety of shapes to make sure nothing sneaks past.
  const EVIL_SLUGS = [
    '../../../../../tmp/pwned',
    '../etc/passwd',
    '..',
    '/absolute/path',
    'slug/with/slashes',
    'slug with spaces',
    'SHOUTING',
    '',
  ];

  async function expectNoFilesystemChange(): Promise<void> {
    // The artifact root may not even exist yet (we only `mkdir` on write),
    // but if it does, it must not contain anything outside expected shape.
    try {
      const entries = await readdir(root);
      // Only pluralized type dirs are legitimate. No '.md' files at root.
      for (const e of entries) {
        expect(e).not.toMatch(/\.md$/);
      }
    } catch {
      /* root doesn't exist yet — fine */
    }
    // Verify nothing was created at /tmp/pwned or /etc/passwd-adjacent.
    // We only check the specific escape target we construct tests from.
    await expect(stat('/tmp/pwned.md')).rejects.toThrow();
  }

  it('read rejects traversal slugs with ValidationError and does not touch the filesystem', async () => {
    for (const slug of EVIL_SLUGS) {
      await expect(
        adapter.read({ type: 'idea', slug }),
      ).rejects.toBeInstanceOf(ValidationError);
    }
    await expectNoFilesystemChange();
  });

  it('write rejects traversal slugs with ValidationError and creates no file', async () => {
    for (const slug of EVIL_SLUGS) {
      const doc: Document = {
        ref: { type: 'idea', slug },
        frontmatter: { name: 'x', type: 'idea', status: 'draft' },
        body: { sections: [], warnings: [] },
        warnings: [],
      };
      await expect(adapter.write(doc)).rejects.toBeInstanceOf(ValidationError);
    }
    await expectNoFilesystemChange();
  });

  it('update rejects traversal slugs with ValidationError', async () => {
    for (const slug of EVIL_SLUGS) {
      await expect(
        adapter.update({ type: 'idea', slug }, { frontmatter: { status: 'validated' } }),
      ).rejects.toBeInstanceOf(ValidationError);
    }
    await expectNoFilesystemChange();
  });

  it('link rejects traversal slugs on from or to with ValidationError', async () => {
    for (const slug of EVIL_SLUGS) {
      await expect(
        adapter.link(
          { type: 'idea', slug },
          'addresses',
          { type: 'opportunity', slug: 'fine' },
        ),
      ).rejects.toBeInstanceOf(ValidationError);
      await expect(
        adapter.link(
          { type: 'idea', slug: 'fine' },
          'addresses',
          { type: 'opportunity', slug },
        ),
      ).rejects.toBeInstanceOf(ValidationError);
    }
    await expectNoFilesystemChange();
  });

  it('unlink rejects traversal slugs on from or to with ValidationError', async () => {
    for (const slug of EVIL_SLUGS) {
      await expect(
        adapter.unlink(
          { type: 'idea', slug },
          'addresses',
          { type: 'opportunity', slug: 'fine' },
        ),
      ).rejects.toBeInstanceOf(ValidationError);
      await expect(
        adapter.unlink(
          { type: 'idea', slug: 'fine' },
          'addresses',
          { type: 'opportunity', slug },
        ),
      ).rejects.toBeInstanceOf(ValidationError);
    }
    await expectNoFilesystemChange();
  });
});

describe('assertUnderRoot (defense-in-depth)', () => {
  const root = '/var/etak/artifacts';

  it('accepts paths inside the root', () => {
    expect(() => assertUnderRoot(root, '/var/etak/artifacts/ideas/foo.md')).not.toThrow();
    expect(() => assertUnderRoot(root, '/var/etak/artifacts/ideas')).not.toThrow();
  });

  it('accepts the exact root itself', () => {
    expect(() => assertUnderRoot(root, root)).not.toThrow();
  });

  it('rejects paths that escape via ..', () => {
    expect(() => assertUnderRoot(root, '/var/etak/artifacts/../other/file.md')).toThrow(
      AdapterError,
    );
  });

  it('rejects sibling directories with the same prefix (trailing-separator safety)', () => {
    // /var/etak/artifacts2 naively startsWith /var/etak/artifacts but must
    // not be considered "under" the root.
    expect(() => assertUnderRoot(root, '/var/etak/artifacts2/ideas/foo.md')).toThrow(
      AdapterError,
    );
  });

  it('rejects completely unrelated absolute paths', () => {
    expect(() => assertUnderRoot(root, '/tmp/pwned.md')).toThrow(AdapterError);
    expect(() => assertUnderRoot(root, '/etc/passwd')).toThrow(AdapterError);
  });
});
