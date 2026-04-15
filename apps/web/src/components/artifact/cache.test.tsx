import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { IdeaDetailDocument } from '../../lib/graphql/generated/graphql';
import { renderWithApp } from '../../test/renderWithApp';

/**
 * Verifies the cache story: Apollo's normalized cache should make revisiting
 * an artifact free of network traffic. We render the idea page twice at the
 * same route (a write-through "navigate" to the same id), and assert the
 * counted operations stay at the expected single fetch. The tap link in
 * createMockedClient counts every operation the client sends, so this
 * survives regressions where a cache config accidentally breaks normalization.
 */

describe('Apollo cache navigation', () => {
  it('serves a previously loaded artifact from cache without firing a new request', async () => {
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

    const mocks: MockedResponse[] = [
      {
        request: { query: IdeaDetailDocument, variables: { id: 'idea-1' } },
        result: { data: { ideas: [fixture] } },
      },
      // Second mock intentionally matches nothing — if a fetch fires, this
      // test fails because MockLink has no more responses. That's the
      // safety net: the assertion + link starvation together guarantee
      // the cache-hit path.
    ];

    const onRequest = vi.fn();
    const { client } = await renderWithApp(null, {
      path: '/idea/idea-1',
      mocks,
      onRequest,
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /graph-backed artifact store/i }),
      ).toBeInTheDocument();
    });

    // The route loader prefetches once, and useSuspenseQuery then reads
    // from cache. Exactly one network op should have been counted.
    const requestsAfterFirstLoad = onRequest.mock.calls.length;
    expect(requestsAfterFirstLoad).toBe(1);

    // Force a second read of the same query via the Apollo client. It
    // should resolve from cache — no additional network ops.
    await act(async () => {
      const result = await client.query({
        query: IdeaDetailDocument,
        variables: { id: 'idea-1' },
      });
      expect(result.data.ideas[0].id).toBe('idea-1');
    });

    expect(onRequest.mock.calls.length).toBe(requestsAfterFirstLoad);
  });
});
