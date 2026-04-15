import { useSuspenseQuery } from '@apollo/client';
import { ArtifactPage } from './ArtifactPage';
import { ArtifactNotFound } from './NotFound';
import { IdeaDetailDocument } from '../../lib/graphql/generated/graphql';
import type { RelationshipSection } from './RelationshipList';

interface IdeaArtifactPageProps {
  id: string;
}

/**
 * Per-type wrapper for Idea. Relationship surfaces: upward via "Addresses"
 * (the opportunities this idea takes a crack at), downward via
 * "Has assumptions" (the claims the idea rests on).
 */
export function IdeaArtifactPage({ id }: IdeaArtifactPageProps) {
  const { data } = useSuspenseQuery(IdeaDetailDocument, {
    variables: { id },
  });

  const idea = data.ideas[0];
  if (!idea) {
    return <ArtifactNotFound type="idea" id={id} />;
  }

  const relationships: RelationshipSection[] = [
    {
      label: 'Addresses',
      items: idea.addresses.map((opp) => ({
        type: 'opportunity' as const,
        id: opp.id,
        name: opp.name,
        status: opp.status,
      })),
    },
    {
      label: 'Has assumptions',
      items: idea.assumptions.map((a) => ({
        type: 'assumption' as const,
        id: a.id,
        name: a.name,
        status: a.status,
      })),
    },
  ];

  return (
    <ArtifactPage
      type="idea"
      name={idea.name}
      status={idea.status}
      body={idea.body}
      createdAt={idea.createdAt}
      updatedAt={idea.updatedAt}
      relationships={relationships}
    />
  );
}
