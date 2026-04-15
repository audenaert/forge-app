import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { ApolloProvider, ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { MockLink, type MockedResponse } from '@apollo/client/testing';
import { RouterProvider } from '@tanstack/react-router';
import { createAppRouter } from '../router';

/**
 * Render the full app at a specific path with a MockLink-backed Apollo
 * client. Used by per-type wrapper tests that need both the router (so
 * navigation and route loaders work) and the Apollo cache (so
 * useSuspenseQuery resolves).
 *
 * Why a real ApolloClient + MockLink instead of MockedProvider: route
 * loaders call `client.query()` directly, and they need to share a cache
 * with the React tree. MockedProvider creates its own internal client, so
 * loaders and components would end up with separate caches. Wiring the
 * same client into the router (via createAppRouter) and into
 * <ApolloProvider> keeps them synchronized.
 */
export interface RenderWithAppOptions {
  path: string;
  mocks: readonly MockedResponse[];
  /** Test hook to observe how many network operations fired. */
  onRequest?: () => void;
}

export interface RenderWithAppResult {
  client: ApolloClient<object>;
  rendered: ReturnType<typeof render>;
}

export function createMockedClient(
  mocks: readonly MockedResponse[],
  onRequest?: () => void,
): ApolloClient<object> {
  const mockLink = new MockLink(mocks);
  // An ApolloLink in front of MockLink that counts operations. Composed
  // via ApolloLink.from so the tap link participates in the normal link
  // chain rather than hand-rolling a request signature.
  const tapLink = new ApolloLink((operation, forward) => {
    onRequest?.();
    return forward(operation);
  });
  return new ApolloClient({
    link: ApolloLink.from([tapLink, mockLink]),
    cache: new InMemoryCache(),
  });
}

export async function renderWithApp(
  _ui: ReactElement | null,
  options: RenderWithAppOptions,
): Promise<RenderWithAppResult> {
  const client = createMockedClient(options.mocks, options.onRequest);

  const router = createAppRouter({
    memory: true,
    initialEntries: [options.path],
    apolloClient: client,
  });

  // Wait for the router loader to settle before mounting so the
  // useSuspenseQuery on the page can read from cache synchronously.
  await router.load();

  const rendered = render(
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>,
  );

  return { client, rendered };
}
