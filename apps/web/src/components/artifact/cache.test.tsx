import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { IdeaDetailDocument } from '../../lib/graphql/generated/graphql';
import { renderWithApp } from '../../test/renderWithApp';

/**
 * Verifies the cache story end-to-end through the router: revisiting an
 * artifact should not fire a new network request because Apollo's
 * normalized cache, populated by the route loader on the first visit,
 * answers the second visit synchronously.
 *
 * The test exercises the full route-level cycle (router.navigate → loader
 * → useSuspenseQuery) rather than poking client.query directly, so it
 * guards against regressions in either the loader wiring or cache
 * normalization. The tap link in createMockedClient counts every operation
 * the client sends; the assertion is that count == 1 after two navigations
 * to the same id.
 */

describe('Apollo cache navigation', () => {
  it('serves a re-navigated artifact from cache without firing a new request', async () => {
    const fixture = {
      __typename: 'Idea',
      id: 'idea-1',
      name: 'Graph-backed artifact store',
      status: 'BUILDING',
      body: 'Body.',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: null,
      addresses: [],
      assumptions: [],
    };

    // Exactly one mock for the idea query. If the cache fails and the
    // loader fires a second fetch, MockLink starves and the test fails —
    // belt-and-braces alongside the explicit count assertion below.
    const mocks: MockedResponse[] = [
      {
        request: { query: IdeaDetailDocument, variables: { id: 'idea-1' } },
        result: { data: { ideas: [fixture] } },
      },
    ];

    const onRequest = vi.fn();
    const { router } = await renderWithApp(null, {
      // Start at "/" so the first visit to /idea/idea-1 is itself a
      // navigation, not the initial mount. This way both reads go
      // through the same router.navigate code path.
      path: '/',
      mocks,
      onRequest,
    });

    // First navigation: loader fires once, the page renders.
    await act(async () => {
      await router.navigate({ to: '/idea/$id', params: { id: 'idea-1' } });
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /graph-backed artifact store/i }),
      ).toBeInTheDocument();
    });

    expect(onRequest).toHaveBeenCalledTimes(1);

    // Navigate away so the next navigation is a real route change rather
    // than a no-op. The placeholder dashboard at "/" is fine — it makes
    // no Apollo queries.
    await act(async () => {
      await router.navigate({ to: '/' });
    });

    // Second navigation to the same id: cache hit, no additional ops.
    await act(async () => {
      await router.navigate({ to: '/idea/$id', params: { id: 'idea-1' } });
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /graph-backed artifact store/i }),
      ).toBeInTheDocument();
    });

    expect(onRequest).toHaveBeenCalledTimes(1);
  });
});
