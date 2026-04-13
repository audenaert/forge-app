// GraphQL storage adapter — stub that throws NotWiredError for every call.
//
// The real implementation lands in a later milestone once the
// graph-backed artifact store project is wired. This stub exists so the
// shared contract test suite can prove two things:
//   1. A stub implementation structurally conforms to the StorageAdapter
//      interface at the type level (the TypeScript compiler enforces this
//      by virtue of `implements StorageAdapter`).
//   2. Every method raises NotWiredError with the expected shape, so the
//      CLI envelope renderer can translate the error into exit code 3
//      with `errors[0].code === 'E_NOT_WIRED'`.
//
// When the real adapter ships, the shared contract test suite becomes its
// acceptance check: swap the factory, drop the `NotWiredError` assertions,
// and the fs adapter's contract tests must pass against graphql too.

import type { StorageAdapter } from '../interface.js';
import type { ArtifactRef, ArtifactType } from '../../schemas/index.js';
import type {
  Document,
  ListFilter,
  UpdateChanges,
  WriteResult,
} from '../operations.js';
import { NotWiredError } from '../errors.js';

const ADAPTER_NAME = 'graphql';

export class GraphqlAdapter implements StorageAdapter {
  public async read(_ref: ArtifactRef): Promise<Document> {
    throw new NotWiredError(ADAPTER_NAME, 'read');
  }

  public async write(_document: Document): Promise<WriteResult> {
    throw new NotWiredError(ADAPTER_NAME, 'write');
  }

  public async list(_type: ArtifactType, _filter?: ListFilter): Promise<ArtifactRef[]> {
    throw new NotWiredError(ADAPTER_NAME, 'list');
  }

  public async update(_ref: ArtifactRef, _changes: UpdateChanges): Promise<WriteResult> {
    throw new NotWiredError(ADAPTER_NAME, 'update');
  }

  public async link(
    _from: ArtifactRef,
    _field: string,
    _to: ArtifactRef,
  ): Promise<WriteResult> {
    throw new NotWiredError(ADAPTER_NAME, 'link');
  }

  public async unlink(
    _from: ArtifactRef,
    _field: string,
    _to: ArtifactRef,
  ): Promise<WriteResult> {
    throw new NotWiredError(ADAPTER_NAME, 'unlink');
  }
}
