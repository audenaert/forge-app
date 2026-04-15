import { useSuspenseQuery } from '@apollo/client';
import { ArtifactPage } from './ArtifactPage';
import { ArtifactNotFound } from './NotFound';
import { AssumptionDetailDocument } from '../../lib/graphql/generated/graphql';
import { labelForImportance, labelForEvidence } from '../../lib/enums';
import type { ArtifactMetadataItem } from './ArtifactHeader';
import type { RelationshipSection } from './RelationshipList';

interface AssumptionArtifactPageProps {
  id: string;
}

/**
 * Per-type wrapper for Assumption. Importance and evidence are the
 * defining discovery-metadata for an assumption, so they both ride in the
 * header metadata block.
 *
 * Relationship surfaces: upward via "Assumed by" (the ideas this
 * assumption is a premise of), downward via "Tested by" (the experiments
 * trying to validate it).
 */
export function AssumptionArtifactPage({ id }: AssumptionArtifactPageProps) {
  const { data } = useSuspenseQuery(AssumptionDetailDocument, {
    variables: { id },
  });

  const assumption = data.assumptions[0];
  if (!assumption) {
    return <ArtifactNotFound type="assumption" id={id} />;
  }

  const metadata: ArtifactMetadataItem[] = [
    { label: 'Importance', value: labelForImportance(assumption.importance) },
    { label: 'Evidence', value: labelForEvidence(assumption.evidence) },
  ];

  const relationships: RelationshipSection[] = [
    {
      label: 'Assumed by',
      items: assumption.assumedBy.map((idea) => ({
        type: 'idea' as const,
        id: idea.id,
        name: idea.name,
        status: idea.status,
      })),
    },
    {
      label: 'Tested by',
      items: assumption.testedBy.map((exp) => ({
        type: 'experiment' as const,
        id: exp.id,
        name: exp.name,
        status: exp.status,
      })),
    },
  ];

  return (
    <ArtifactPage
      type="assumption"
      name={assumption.name}
      status={assumption.status}
      body={assumption.body}
      metadata={metadata}
      createdAt={assumption.createdAt}
      updatedAt={assumption.updatedAt}
      relationships={relationships}
    />
  );
}
