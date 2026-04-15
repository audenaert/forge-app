import { useSuspenseQuery } from '@apollo/client';
import { ArtifactPage } from './ArtifactPage';
import { ArtifactNotFound } from './NotFound';
import { ObjectiveDetailDocument } from '../../lib/graphql/generated/graphql';
import type { RelationshipSection } from './RelationshipList';

interface ObjectiveArtifactPageProps {
  id: string;
}

/**
 * Per-type wrapper for Objective. Fires the ObjectiveDetail query, projects
 * the response into the generic ArtifactPage's prop shape, and picks the
 * right relationship sections for the type.
 *
 * Objectives have exactly one upward relationship surface in the current
 * schema — "Supported by" (opportunities that point at this objective).
 * There is no downward surface; objectives are the top of the tree.
 */
export function ObjectiveArtifactPage({ id }: ObjectiveArtifactPageProps) {
  const { data } = useSuspenseQuery(ObjectiveDetailDocument, {
    variables: { id },
  });

  const objective = data.objectives[0];
  if (!objective) {
    return <ArtifactNotFound type="objective" id={id} />;
  }

  const relationships: RelationshipSection[] = [
    {
      label: 'Supported by',
      items: objective.supportedBy.map((opp) => ({
        type: 'opportunity' as const,
        id: opp.id,
        name: opp.name,
        status: opp.status,
      })),
    },
  ];

  return (
    <ArtifactPage
      type="objective"
      name={objective.name}
      status={objective.status}
      body={objective.body}
      createdAt={objective.createdAt}
      updatedAt={objective.updatedAt}
      relationships={relationships}
    />
  );
}
