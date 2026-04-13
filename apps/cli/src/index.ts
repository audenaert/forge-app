// Library entry point for @etak/cli.
//
// The package is consumed primarily as a bin (`etak`), but this module
// exposes the internal schema and adapter surface so adjacent packages
// (future web UI, shared-contract tests) can import validated types and
// storage-adapter implementations directly.
//
// Command wiring and output rendering land in later stories (M1-S5+).

// Schemas are the single source of truth for the artifact model:
// ArtifactType, ArtifactRef, BodyTemplate, DriftWarning, StructuredError,
// per-type frontmatter schemas, and `BODY_TEMPLATES`.
export * from './schemas/index.js';

// Adapter-operation types — runtime plumbing of the storage adapter
// surface. These are distinct from the schemas artifact model: the schemas
// package owns the persistent artifact shape (including `BodySection` and
// `BodyDocument`, re-exported above), while this file's types describe how
// the adapter is called and what it returns.
export type {
  ArtifactFrontmatter,
  BodyReplaceUpdate,
  BodyUpdate,
  Document,
  ListFilter,
  SectionReplaceUpdate,
  UpdateChanges,
  WriteResult,
} from './adapters/operations.js';

export type { StorageAdapter } from './adapters/interface.js';
export { FsAdapter } from './adapters/fs/fs-adapter.js';
export { GraphqlAdapter } from './adapters/graphql/graphql-adapter.js';
export {
  AdapterBaseError,
  AdapterError,
  NotFoundError,
  NotWiredError,
  ValidationError,
} from './adapters/errors.js';

export { discoverProjectRoot } from './config/discover-root.js';
export { resolveBackend } from './config/resolve-backend.js';
export type { BackendKind, ResolvedConfig } from './config/resolve-backend.js';
export { makeAdapter } from './config/adapter-factory.js';
