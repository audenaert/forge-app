// Fs adapter contract run. Each test gets a fresh tempdir under the
// adapter root, so adapter instances are isolated and parallel-safe.

import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { FsAdapter } from '../../src/index.js';
import { runAdapterContractTests } from './contract.js';

runAdapterContractTests({
  name: 'FsAdapter',
  factory: async () => {
    const dir = await mkdtemp(join(tmpdir(), 'etak-fs-adapter-'));
    const adapter = new FsAdapter({ root: dir });
    return {
      adapter,
      cleanup: async () => {
        await rm(dir, { recursive: true, force: true });
      },
    };
  },
});
