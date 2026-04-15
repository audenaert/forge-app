import { ArtifactHeader, type ArtifactMetadataItem } from './ArtifactHeader';
import { ArtifactBody } from './ArtifactBody';
import { RelationshipList, type RelationshipSection } from './RelationshipList';
import type { ArtifactType } from '../../lib/enums';

interface ArtifactPageProps {
  type: ArtifactType;
  name: string;
  status: string;
  body: string | null | undefined;
  metadata?: ArtifactMetadataItem[];
  createdAt?: string | null;
  updatedAt?: string | null;
  relationships: RelationshipSection[];
}

/**
 * Generic artifact page shell — header + body + relationships. This
 * component is deliberately type-agnostic: it knows how to render "an
 * artifact", but it knows nothing about what "an Opportunity" is or which
 * relationship names belong on an Idea. That logic lives in the per-type
 * wrappers, which fire the right detail query, project the result into
 * the prop shape this component expects, and hand off rendering.
 *
 * Keeping the shell type-agnostic is what makes it easy to add a new
 * artifact type later: the wrapper pattern localises all the per-type
 * mapping in one place.
 */
export function ArtifactPage({
  type,
  name,
  status,
  body,
  metadata,
  createdAt,
  updatedAt,
  relationships,
}: ArtifactPageProps) {
  return (
    <article
      data-testid="artifact-page"
      data-artifact-type={type}
      className="mx-auto flex max-w-3xl flex-col gap-4 px-8 py-10"
    >
      <ArtifactHeader
        type={type}
        name={name}
        status={status}
        metadata={metadata}
        createdAt={createdAt}
        updatedAt={updatedAt}
      />
      <ArtifactBody body={body} />
      <RelationshipList sections={relationships} />
    </article>
  );
}
