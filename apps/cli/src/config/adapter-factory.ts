// Adapter factory — instantiate the right StorageAdapter for a
// ResolvedConfig. The chassis (M1-S5) calls this once at startup and
// passes the resulting adapter into every command handler.

import type { StorageAdapter } from '../adapters/interface.js';
import { FsAdapter } from '../adapters/fs/fs-adapter.js';
import { GraphqlAdapter } from '../adapters/graphql/graphql-adapter.js';
import type { ResolvedConfig } from './resolve-backend.js';

export function makeAdapter(config: ResolvedConfig): StorageAdapter {
  switch (config.backend) {
    case 'fs':
      return new FsAdapter({ root: config.artifactRoot });
    case 'graphql':
      return new GraphqlAdapter();
  }
}
