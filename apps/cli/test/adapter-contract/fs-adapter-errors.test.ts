// Error-class mapping tests for the filesystem adapter.
//
// Per design.md §4.3 the exit-code table is:
//   0 = success
//   1 = validation error (user can fix by editing the file)
//   2 = not found (slug/file doesn't exist)
//   3 = adapter/IO error (system-level failure)
//
// These tests pin the error class for user-correctable frontmatter and
// markdown problems so a regression that re-maps them to AdapterError
// (which would produce the wrong exit code) fails loudly.

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { FsAdapter, ValidationError } from '../../src/index.js';

describe('FsAdapter error-class mapping for user-correctable problems', () => {
  let root: string;
  let adapter: FsAdapter;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'etak-fs-errors-'));
    adapter = new FsAdapter({ root });
    await mkdir(join(root, 'ideas'), { recursive: true });
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  async function putIdea(slug: string, body: string): Promise<void> {
    await writeFile(join(root, 'ideas', `${slug}.md`), body, 'utf8');
  }

  it('raises ValidationError when frontmatter is missing entirely', async () => {
    await putIdea('no-frontmatter', '## Description\n\nHello.\n');
    await expect(adapter.read({ type: 'idea', slug: 'no-frontmatter' })).rejects.toBeInstanceOf(
      ValidationError,
    );
    await expect(adapter.read({ type: 'idea', slug: 'no-frontmatter' })).rejects.toMatchObject({
      exitCode: 1,
      code: 'E_VALIDATION',
    });
  });

  it('raises ValidationError when YAML is malformed', async () => {
    await putIdea(
      'bad-yaml',
      '---\nname: "oops\ntype: idea\n---\n\n## Description\n\nHi.\n',
    );
    await expect(adapter.read({ type: 'idea', slug: 'bad-yaml' })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it('raises ValidationError when frontmatter is not a YAML mapping', async () => {
    await putIdea('list-yaml', '---\n- one\n- two\n---\n\n## Description\n\nHi.\n');
    await expect(adapter.read({ type: 'idea', slug: 'list-yaml' })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it('raises ValidationError when required `name` is missing', async () => {
    await putIdea('no-name', '---\ntype: idea\nstatus: draft\n---\n\n## Description\n\nHi.\n');
    await expect(adapter.read({ type: 'idea', slug: 'no-name' })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it('raises ValidationError when required `type` is missing', async () => {
    await putIdea('no-type', '---\nname: No Type\nstatus: draft\n---\n\n## Description\n\nHi.\n');
    await expect(adapter.read({ type: 'idea', slug: 'no-type' })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it('raises ValidationError when frontmatter type does not match ref type', async () => {
    await putIdea(
      'wrong-type',
      '---\nname: Wrong\ntype: opportunity\nstatus: draft\n---\n\n## Description\n\nHi.\n',
    );
    await expect(adapter.read({ type: 'idea', slug: 'wrong-type' })).rejects.toBeInstanceOf(
      ValidationError,
    );
    await expect(adapter.read({ type: 'idea', slug: 'wrong-type' })).rejects.toMatchObject({
      exitCode: 1,
    });
  });
});
