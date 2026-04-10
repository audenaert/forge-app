import { getServer } from './setup.js';
import type { GraphQLFormattedError } from 'graphql';

interface GraphQLResponse<T = Record<string, unknown>> {
  data?: T;
  errors?: GraphQLFormattedError[];
}

/**
 * Execute a GraphQL operation against the Apollo Server instance.
 * Uses executeOperation — no HTTP server needed.
 */
export async function executeGraphQL<T = Record<string, unknown>>(
  query: string,
  variables?: Record<string, unknown>,
  contextValue?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  const server = getServer();
  const response = await server.executeOperation(
    {
      query,
      variables,
    },
    {
      contextValue: contextValue ?? { domainSlug: 'default' },
    }
  );

  if (response.body.kind === 'single') {
    return {
      data: response.body.singleResult.data as T | undefined,
      errors: response.body.singleResult.errors ?? undefined,
    };
  }

  throw new Error('Unexpected incremental response');
}

// --- Common GraphQL fragments ---

export const DOMAIN_FIELDS = `
  fragment DomainFields on Domain {
    id
    slug
    name
    createdAt
  }
`;

export const OBJECTIVE_FIELDS = `
  fragment ObjectiveFields on Objective {
    id
    name
    status
    body
    createdAt
    updatedAt
  }
`;

export const OPPORTUNITY_FIELDS = `
  fragment OpportunityFields on Opportunity {
    id
    name
    status
    hmw
    body
    createdAt
    updatedAt
  }
`;

export const IDEA_FIELDS = `
  fragment IdeaFields on Idea {
    id
    name
    status
    body
    createdAt
    updatedAt
  }
`;

export const ASSUMPTION_FIELDS = `
  fragment AssumptionFields on Assumption {
    id
    name
    status
    importance
    evidence
    body
    createdAt
    updatedAt
  }
`;

export const EXPERIMENT_FIELDS = `
  fragment ExperimentFields on Experiment {
    id
    name
    status
    method
    successCriteria
    duration
    effort
    result
    learnings
    body
    createdAt
    updatedAt
  }
`;
