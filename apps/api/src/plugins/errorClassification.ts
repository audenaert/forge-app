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
function classifyError(error: GraphQLError): ClassifiedExtensions {
  const originalError = error.originalError as Record<string, unknown> | undefined;

  // Neo4j constraint violation (Neo4jError with code Neo.ClientError.Schema.ConstraintValidationFailed)
  if (originalError && typeof originalError === 'object') {
    const neo4jCode = (originalError as { code?: string }).code;
    const message = originalError.message as string | undefined;

    if (neo4jCode === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
      // Extract constraint name from the error message
      const constraintMatch = message?.match(/constraint (\S+)/i);
      return {
        code: 'CONSTRAINT_VIOLATION',
        ...(constraintMatch?.[1] ? { constraint: constraintMatch[1] } : {}),
      };
    }

    // Neo4j not found errors
    if (neo4jCode === 'Neo.ClientError.Statement.EntityNotFound') {
      return { code: 'NOT_FOUND' };
    }
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
