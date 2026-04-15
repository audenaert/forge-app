import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { TreeRail } from './TreeRail';
import { renderWithRouter } from '../../test/renderWithRouter';
import type { TreeNode, UnrootedEntry } from '../../lib/treeProjection';

const tree: TreeNode = {
  type: 'objective',
  id: 'obj-1',
  name: 'Accelerate discovery',
  status: 'ACTIVE',
  children: [
    {
      type: 'opportunity',
      id: 'opp-1',
      name: 'Teams have no model',
      status: 'ACTIVE',
      children: [],
    },
  ],
};

describe('<TreeRail />', () => {
  it('renders the heading, the tree projection, and the unrooted disclosure', async () => {
    const unrooted: UnrootedEntry[] = [
      { type: 'opportunity', id: 'opp-99', name: 'Floating opportunity', status: 'ACTIVE' },
    ];
    await renderWithRouter(
      <TreeRail
        heading="Tree: Objective"
        root={tree}
        selectedId="obj-1"
        unrooted={unrooted}
        unrootedLabel="Unrooted opportunities"
        unrootedEmptyMessage="No orphaned opportunities."
      />,
    );
    expect(screen.getByText(/tree: objective/i)).toBeInTheDocument();
    expect(screen.getByRole('tree')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-obj-1')).toBeInTheDocument();

    const disclosure = screen.getByTestId('tree-unrooted');
    expect(disclosure).toBeInTheDocument();
    // The disclosure is a native <details> — its summary is the label.
    expect(screen.getByText('Unrooted opportunities')).toBeInTheDocument();

    // The unrooted entry is rendered as an ArtifactLink (semantic <a>),
    // so we should be able to find it by role.
    const link = screen.getByRole('link', {
      name: /opportunity: floating opportunity/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/opportunity/opp-99');
  });

  it('renders the empty-state message when there are no unrooted entries', async () => {
    await renderWithRouter(
      <TreeRail
        heading="Tree: Objective"
        root={tree}
        selectedId="obj-1"
        unrooted={[]}
        unrootedLabel="Unrooted opportunities"
        unrootedEmptyMessage="No orphaned opportunities in this domain."
      />,
    );
    expect(screen.getByTestId('tree-unrooted-empty')).toHaveTextContent(
      /no orphaned opportunities/i,
    );
    expect(screen.queryByTestId('tree-unrooted-list')).not.toBeInTheDocument();
  });
});
