// The storage adapter interface — the single contract that every backend
// (filesystem, future GraphQL, future anything) implements. The adapter
// exchanges typed domain objects; markdown parsing and drift detection
// live inside the fs adapter, not at this boundary. See design spec §1.

import type { ArtifactRef, ArtifactType } from '../schemas/index.js';
import type {
  Document,
  ListFilter,
  UpdateChanges,
  WriteResult,
} from './operations.js';

/**
 * The full adapter surface. v1 has no `delete` operation — per §1, removal
 * is not exposed through the interface. All methods return promises; all
 * errors are instances of {@link ./errors.ts#AdapterBaseError}.
 */
export interface StorageAdapter {
  /**
   * Resolve a ref to a parsed `Document`. Throws `NotFoundError` when the
   * ref does not exist. Drift warnings encountered during parse are carried
   * on `document.body.warnings` and mirrored on `document.warnings`.
   */
  read(ref: ArtifactRef): Promise<Document>;

  /**
   * Write a new artifact. Errors on slug collision by default (design §5).
   * Returns the re-parsed document plus any drift warnings produced by
   * round-tripping through the parser/serializer.
   */
  write(document: Document): Promise<WriteResult>;

  /**
   * List refs of a given artifact type. Optional filter matches status and
   * arbitrary frontmatter fields.
   */
  list(type: ArtifactType, filter?: ListFilter): Promise<ArtifactRef[]>;

  /**
   * Apply a patch to an existing artifact. Frontmatter field merges and a
   * single body update (section-replace or body-replace) are supported.
   * Throws `NotFoundError` when the ref does not exist.
   */
  update(ref: ArtifactRef, changes: UpdateChanges): Promise<WriteResult>;

  /**
   * Add `to` to the typed link field `field` on `from`. For array fields
   * (e.g. `addresses`, `supports`) appends if not already present. For
   * scalar link fields (`target`, `delivered_by`) replaces the existing
   * value. Emits a `dangling_ref` warning (non-fatal) when `to` does not
   * resolve; the write still lands per §2.
   */
  link(
    from: ArtifactRef,
    field: string,
    to: ArtifactRef,
  ): Promise<WriteResult>;

  /**
   * Remove `to` from the typed link field `field` on `from`. For array
   * fields, removes the matching entry. For scalar fields, clears the
   * value. Removing a link that isn't present is a no-op with a
   * `link_not_present` warning per §2.
   */
  unlink(
    from: ArtifactRef,
    field: string,
    to: ArtifactRef,
  ): Promise<WriteResult>;
}
