import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { IdeaDetailDocument } from '../../lib/graphql/generated/graphql';
import { renderWithApp } from '../../test/renderWithApp';

describe('Apollo cache navigation', () => {
  it('serves a re-navigated artifact from cache without firing a new request', async () => {
    const idea1 = {
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
    const idea2 = {
      __typename: 'Idea',
      id: 'idea-2',
      name: 'Other idea',
      status: 'BUILDING',
      body: 'Body.',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: null,
      addresses: [],
      assumptions: [],
    };

    // Exactly one mock per idea. If the cache fails and the loader fires a
    // second fetch for the same idea, MockLink starves and the test fails.
    const mocks: MockedResponse[] = [
      {
        request: { query: IdeaDetailDocument, variables: { id: 'idea-1' } },
        result: { data: { ideas: [idea1] } },
      },
      {
        request: { query: IdeaDetailDocument, variables: { id: 'idea-2' } },
        result: { data: { ideas: [idea2] } },
      },
    ];

    const onRequest = vi.fn();
    const { router } = await renderWithApp(null, {
      path: '/idea/idea-1',
      mocks,
      onRequest,
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /graph-backed artifact store/i }),
      ).toBeInTheDocument();
    });

    expect(onRequest).toHaveBeenCalledTimes(1);

    await act(async () => {
      await router.navigate({ to: '/idea/$id', params: { id: 'idea-2' } });
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /other idea/i }),
      ).toBeInTheDocument();
    });

    expect(onRequest).toHaveBeenCalledTimes(2);

    await act(async () => {
      await router.navigate({ to: '/idea/$id', params: { id: 'idea-1' } });
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /graph-backed artifact store/i }),
      ).toBeInTheDocument();
    });

    expect(onRequest).toHaveBeenCalledTimes(2);
  });
});
