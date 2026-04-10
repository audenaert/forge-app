import type { ApolloServerPlugin } from '@apollo/server';

/**
 * Apollo Server plugin that logs operation name and duration for each request.
 * Does NOT log query variables (may contain user data).
 */
export function queryTimingPlugin(): ApolloServerPlugin {
  return {
    async requestDidStart({ request }) {
      const start = performance.now();
      const operationName = request.operationName ?? 'anonymous';

      return {
        async willSendResponse({ response }) {
          const duration = (performance.now() - start).toFixed(2);
          const hasErrors =
            response.body.kind === 'single' &&
            response.body.singleResult.errors &&
            response.body.singleResult.errors.length > 0;

          if (hasErrors) {
            const errors = response.body.kind === 'single'
              ? response.body.singleResult.errors ?? []
              : [];
            for (const error of errors) {
              console.error(
                `[GraphQL] ${operationName} ERROR (${duration}ms): ${error.message}`,
                error.extensions?.code ? `[${error.extensions.code}]` : ''
              );
            }
          } else {
            console.log(`[GraphQL] ${operationName} OK (${duration}ms)`);
          }
        },
      };
    },
  };
}
