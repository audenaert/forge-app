// Config resolution tests. Covered here (rather than under test/unit)
// because test/unit is reserved for the M1-S3 schemas work.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  discoverProjectRoot,
  resolveBackend,
  makeAdapter,
  FsAdapter,
  GraphqlAdapter,
  NotFoundError,
} from '../../src/index.js';

describe('config resolution', () => {
  let projectRoot: string;
  let nestedCwd: string;

  beforeAll(async () => {
    projectRoot = await mkdtemp(join(tmpdir(), 'etak-config-'));
    await mkdir(join(projectRoot, '.etak', 'artifacts'), { recursive: true });
    nestedCwd = join(projectRoot, 'src', 'deep');
    await mkdir(nestedCwd, { recursive: true });
  });

  afterAll(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  it('discoverProjectRoot walks up from a nested cwd to the nearest .etak/ marker', async () => {
    const found = await discoverProjectRoot({ cwd: nestedCwd });
    expect(found).toBe(projectRoot);
  });

  it('discoverProjectRoot throws NotFoundError when no marker exists', async () => {
    const isolated = await mkdtemp(join(tmpdir(), 'etak-noproject-'));
    try {
      await expect(discoverProjectRoot({ cwd: isolated })).rejects.toBeInstanceOf(NotFoundError);
    } finally {
      await rm(isolated, { recursive: true, force: true });
    }
  });

  it('resolveBackend defaults to fs and walks up to discover the project root', async () => {
    const config = await resolveBackend({ cwd: nestedCwd, env: {} });
    expect(config.backend).toBe('fs');
    expect(config.projectRoot).toBe(projectRoot);
    expect(config.artifactRoot).toBe(join(projectRoot, '.etak', 'artifacts'));
  });

  it('ETAK_ROOT overrides walk-up discovery', async () => {
    const config = await resolveBackend({
      cwd: nestedCwd,
      env: { ETAK_ROOT: projectRoot },
    });
    expect(config.projectRoot).toBe(projectRoot);
  });

  it('ETAK_ARTIFACTS overrides the default artifact directory', async () => {
    const override = join(projectRoot, 'custom-artifacts');
    const config = await resolveBackend({
      cwd: nestedCwd,
      env: { ETAK_ARTIFACTS: override },
    });
    expect(config.artifactRoot).toBe(override);
  });

  it('ETAK_BACKEND=graphql selects the graphql adapter factory', async () => {
    const config = await resolveBackend({
      cwd: nestedCwd,
      env: { ETAK_BACKEND: 'graphql' },
    });
    expect(config.backend).toBe('graphql');
    expect(makeAdapter(config)).toBeInstanceOf(GraphqlAdapter);
  });

  it('default ETAK_BACKEND yields an FsAdapter', async () => {
    const config = await resolveBackend({ cwd: nestedCwd, env: {} });
    expect(makeAdapter(config)).toBeInstanceOf(FsAdapter);
  });
});
