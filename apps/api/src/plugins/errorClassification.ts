import type { ApolloServerPlugin } from '@apollo/server';
import { GraphQLError } from 'graphql';

type ErrorCode = 'VALIDATION_ERROR' | 'CONSTRAINT_VIOLATION' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL_ERROR';

interface ClassifiedExtensions {
  code: ErrorCode;
  constraint?: string;
}

/**
 * Classify a GraphQL error into one of our standard error codes.
 * Inspects the original error to determine the category.
 */
/**
 * Walk the error cause chain looking for a Neo4j error code.
 * @neo4j/graphql may wrap the original Neo4jError in one or more layers.
 */
function findNeo4jCode(error: unknown): { code?: string; message?: string } | null {
  let current: unknown = error;
  const seen = new Set<unknown>();
  while (current && typeof current === 'object' && !seen.has(current)) {
    seen.add(current);
    const obj = current as Record<string, unknown>;
    if (typeof obj.code === 'string' && obj.code.startsWith('Neo.')) {
      return { code: obj.code, message: obj.message as string | undefined };
    }
    // Check nested cause / originalError
    current = obj.cause ?? obj.originalError ?? null;
  }
  return null;
}

function classifyError(error: GraphQLError): ClassifiedExtensions {
  const originalError = error.originalError as Record<string, unknown> | undefined;

  // Neo4j constraint violation (Neo4jError with code Neo.ClientError.Schema.ConstraintValidationFailed)
  // Walk the error chain since @neo4j/graphql may wrap the original error
  if (originalError && typeof originalError === 'object') {
    const neo4j = findNeo4jCode(originalError);

    if (neo4j?.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
      const constraintMatch = neo4j.message?.match(/constraint (\S+)/i);
      return {
        code: 'CONSTRAINT_VIOLATION',
        ...(constraintMatch?.[1] ? { constraint: constraintMatch[1] } : {}),
      };
    }

    if (neo4j?.code === 'Neo.ClientError.Statement.EntityNotFound') {
      return { code: 'NOT_FOUND' };
    }
  }

  // Fallback: check the error message for constraint violation indicators.
  // @neo4j/graphql may strip the original error but preserve the message.
  if (error.message?.match(/constraint\s+validation\s+failed/i) ||
      (error.message?.match(/constraint/i) && error.message?.match(/already exists/i))) {
    const constraintMatch = error.message.match(/constraint (\S+)/i);
    return {
      code: 'CONSTRAINT_VIOLATION',
      ...(constraintMatch?.[1] ? { constraint: constraintMatch[1] } : {}),
    };
  }

  // GraphQL validation errors come with specific extension codes
  const existingCode = error.extensions?.code as string | undefined;
  if (
    existingCode === 'GRAPHQL_VALIDATION_FAILED' ||
    existingCode === 'BAD_USER_INPUT'
  ) {
    return { code: 'VALIDATION_ERROR' };
  }

  // Default: internal error
  return { code: 'INTERNAL_ERROR' };
}

export function errorClassificationPlugin(): ApolloServerPlugin {
  return {
    async requestDidStart() {
      return {
        async willSendResponse({ response }) {
          if (response.body.kind === 'single' && response.body.singleResult.errors) {
            response.body.singleResult.errors = response.body.singleResult.errors.map(
              (error) => {
                // Don't reclassify errors that already have our codes
                if (['VALIDATION_ERROR', 'CONSTRAINT_VIOLATION', 'NOT_FOUND', 'UNAUTHORIZED', 'INTERNAL_ERROR'].includes(error.extensions?.code as string)) {
                  return error;
                }

                const classification = classifyError(error as GraphQLError);
                return new GraphQLError(error.message, {
                  nodes: (error as GraphQLError).nodes,
                  source: (error as GraphQLError).source,
                  positions: (error as GraphQLError).positions,
                  path: error.path,
                  originalError: (error as GraphQLError).originalError,
                  extensions: {
                    ...error.extensions,
                    ...classification,
                  },
                });
              }
            );
          }
        },
      };
    },
  };
}
