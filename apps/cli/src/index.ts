// Library entry point for @etak/cli.
//
// The package is consumed primarily as a bin (`etak`), but this module
// exposes the internal schema and adapter surface so adjacent packages
// (future web UI, shared-contract tests) can import validated types and
// storage-adapter implementations directly.
//
// Command wiring and output rendering land in later stories (M1-S5+).

// Schemas win for all shared type names (ArtifactType, BodyDocument,
// BodySection, BodyTemplate, DriftWarning, StructuredError, etc.).
export * from './schemas/index.js';

// Adapter-specific types that aren't part of the schema surface.
// NOTE: `apps/cli/src/adapters/types.ts` still holds local duplicates of
// the shared types for adapter-internal use. Collapsing those into
// `./schemas` is a tracked follow-up.
export type {
  ArtifactFrontmatter,
  BodyReplaceUpdate,
  BodyUpdate,
  Document,
  ListFilter,
  SectionReplaceUpdate,
  UpdateChanges,
  WriteResult,
} from './adapters/types.js';

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
export { getBodyTemplate, isOpaqueBody } from './adapters/templates.js';

export { discoverProjectRoot } from './config/discover-root.js';
export { resolveBackend } from './config/resolve-backend.js';
export type { BackendKind, ResolvedConfig } from './config/resolve-backend.js';
export { makeAdapter } from './config/adapter-factory.js';
