import { useSuspenseQuery } from '@apollo/client';
import { ArtifactPage } from './ArtifactPage';
import { ArtifactNotFound } from './NotFound';
import { OpportunityDetailDocument } from '../../lib/graphql/generated/graphql';
import type { ArtifactMetadataItem } from './ArtifactHeader';
import type { RelationshipSection } from './RelationshipList';

interface OpportunityArtifactPageProps {
  id: string;
}

/**
 * Per-type wrapper for Opportunity. Exposes the `hmw` ("How might we")
 * framing in the header metadata — this is the opportunity's defining
 * content beyond its name, so it belongs above the fold.
 *
 * Relationship surfaces: upward via "Supports" (the objectives this
 * opportunity supports), downward via "Addressed by" (the ideas taking a
 * crack at it).
 */
export function OpportunityArtifactPage({ id }: OpportunityArtifactPageProps) {
  const { data } = useSuspenseQuery(OpportunityDetailDocument, {
    variables: { id },
  });

  const opportunity = data.opportunities[0];
  if (!opportunity) {
    return <ArtifactNotFound type="opportunity" id={id} />;
  }

  const metadata: ArtifactMetadataItem[] = [];
  if (opportunity.hmw) {
    metadata.push({ label: 'How might we', value: opportunity.hmw });
  }

  const relationships: RelationshipSection[] = [
    {
      label: 'Supports',
      items: opportunity.supports.map((obj) => ({
        type: 'objective' as const,
        id: obj.id,
        name: obj.name,
        status: obj.status,
      })),
    },
    {
      label: 'Addressed by',
      items: opportunity.addressedBy.map((idea) => ({
        type: 'idea' as const,
        id: idea.id,
        name: idea.name,
        status: idea.status,
      })),
    },
  ];

  return (
    <ArtifactPage
      type="opportunity"
      name={opportunity.name}
      status={opportunity.status}
      body={opportunity.body}
      metadata={metadata}
      createdAt={opportunity.createdAt}
      updatedAt={opportunity.updatedAt}
      relationships={relationships}
    />
  );
}
