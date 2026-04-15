import { useSuspenseQuery } from '@apollo/client';
import { ArtifactPage } from './ArtifactPage';
import { ArtifactNotFound } from './NotFound';
import { ExperimentDetailDocument } from '../../lib/graphql/generated/graphql';
import {
  labelForExperimentMethod,
  labelForExperimentResult,
  labelForEffort,
} from '../../lib/enums';
import type { ArtifactMetadataItem } from './ArtifactHeader';
import type { RelationshipSection } from './RelationshipList';

interface ExperimentArtifactPageProps {
  id: string;
}

/**
 * Per-type wrapper for Experiment. Experiments have the richest header
 * metadata of any type — method, success criteria, duration, effort,
 * result, learnings. Result and learnings are meaningful only once the
 * experiment has run, but we still render their slots (as "—") so the
 * layout stays consistent across states.
 *
 * Relationship surface: "Tests" (the assumptions this experiment is
 * trying to validate). There is no downward surface — experiments are
 * leaves of the discovery tree.
 */
export function ExperimentArtifactPage({ id }: ExperimentArtifactPageProps) {
  const { data } = useSuspenseQuery(ExperimentDetailDocument, {
    variables: { id },
  });

  const experiment = data.experiments[0];
  if (!experiment) {
    return <ArtifactNotFound type="experiment" id={id} />;
  }

  const metadata: ArtifactMetadataItem[] = [
    { label: 'Method', value: labelForExperimentMethod(experiment.method) || '—' },
    { label: 'Success criteria', value: experiment.successCriteria ?? '—' },
    { label: 'Duration', value: experiment.duration ?? '—' },
    { label: 'Effort', value: labelForEffort(experiment.effort) || '—' },
    { label: 'Result', value: labelForExperimentResult(experiment.result) || '—' },
    { label: 'Learnings', value: experiment.learnings ?? '—' },
  ];

  const relationships: RelationshipSection[] = [
    {
      label: 'Tests',
      items: experiment.tests.map((a) => ({
        type: 'assumption' as const,
        id: a.id,
        name: a.name,
        status: a.status,
      })),
    },
  ];

  return (
    <ArtifactPage
      type="experiment"
      name={experiment.name}
      status={experiment.status}
      body={experiment.body}
      metadata={metadata}
      createdAt={experiment.createdAt}
      updatedAt={experiment.updatedAt}
      relationships={relationships}
    />
  );
}
