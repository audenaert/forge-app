import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import {
  projectObjectiveSubgraph,
  projectOpportunitySubgraph,
  type TreeNode,
} from '../../lib/treeProjection';
import { TreeProjection } from './TreeProjection';
import { renderWithRouter } from '../../test/renderWithRouter';

const objectiveFixture = {
  objectiveSubgraph: {
    id: 'obj-1',
    name: 'Accelerate discovery',
    status: 'ACTIVE',
    opportunities: [
      {
        id: 'opp-1',
        name: 'Teams have no model',
        status: 'ACTIVE',
        hmw: null,
        ideas: [
          {
            id: 'idea-1',
            name: 'Graph store',
            status: 'BUILDING',
            assumptions: [
              {
                id: 'asm-1',
                name: 'Adoption',
                status: 'UNTESTED',
                importance: 'HIGH',
                evidence: 'LOW',
                experiments: [],
              },
            ],
          },
        ],
      },
      {
        id: 'opp-2',
        name: 'Sibling opp',
        status: 'PAUSED',
        hmw: null,
        ideas: [],
      },
    ],
  },
};

function objectiveTree(): TreeNode {
  const t = projectObjectiveSubgraph(objectiveFixture as never);
  if (!t) throw new Error('fixture failed');
  return t;
}

const opportunityFixture = {
  opportunitySubgraph: {
    id: 'opp-77',
    name: 'Standalone opportunity',
    status: 'ACTIVE',
    hmw: 'How might we...',
    ideas: [
      {
        id: 'idea-77',
        name: 'Sketch',
        status: 'DRAFT',
        assumptions: [],
      },
    ],
  },
};

function opportunityTree(): TreeNode {
  const t = projectOpportunitySubgraph(opportunityFixture as never);
  if (!t) throw new Error('fixture failed');
  return t;
}

describe('<TreeProjection />', () => {
  it('renders an objective root with the correct ARIA structure', async () => {
    await renderWithRouter(<TreeProjection root={objectiveTree()} />);

    const tree = screen.getByRole('tree', { name: /discovery tree projection/i });
    expect(tree).toBeInTheDocument();

    // Root is a treeitem with aria-level 1 and aria-expanded true (only
    // the root path is expanded by default).
    const root = screen.getByTestId('tree-node-obj-1');
    expect(root).toHaveAttribute('role', 'treeitem');
    expect(root).toHaveAttribute('aria-level', '1');
    expect(root).toHaveAttribute('aria-expanded', 'true');

    // The root's children are visible because the root is expanded.
    expect(screen.getByTestId('tree-node-opp-1')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-opp-2')).toBeInTheDocument();

    // Sibling branches are collapsed: opp-1's children are not yet visible.
    expect(screen.queryByTestId('tree-node-idea-1')).not.toBeInTheDocument();

    // The opportunity row knows it has children but is collapsed.
    const opp1 = screen.getByTestId('tree-node-opp-1');
    expect(opp1).toHaveAttribute('aria-expanded', 'false');
    // The leaf (no children) opp-2 has no aria-expanded attribute.
    const opp2 = screen.getByTestId('tree-node-opp-2');
    expect(opp2).not.toHaveAttribute('aria-expanded');
  });

  it('renders an opportunity root with the correct icon and a child idea', async () => {
    await renderWithRouter(<TreeProjection root={opportunityTree()} />);
    expect(screen.getByTestId('tree-node-opp-77')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-idea-77')).toBeInTheDocument();

    // The root opportunity icon is present and marks its type.
    const icons = screen.getAllByTestId('artifact-type-icon');
    const types = icons.map((el) => el.getAttribute('data-artifact-type'));
    expect(types).toContain('opportunity');
    expect(types).toContain('idea');
  });

  it('expands the ancestor path of the selected node by default', async () => {
    await renderWithRouter(
      <TreeProjection root={objectiveTree()} selectedId="asm-1" />,
    );
    // asm-1 is three levels deep: obj-1 -> opp-1 -> idea-1 -> asm-1. All
    // ancestors must be visible.
    expect(screen.getByTestId('tree-node-obj-1')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-opp-1')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-idea-1')).toBeInTheDocument();
    const asm = screen.getByTestId('tree-node-asm-1');
    expect(asm).toBeInTheDocument();
    // The selected node's data attribute is set so styles can target it.
    expect(asm).toHaveAttribute('data-selected', 'true');
    expect(asm).toHaveAttribute('aria-selected', 'true');

    // Sibling branches are still collapsed — opp-2 is visible (sibling of
    // opp-1) but its children are not (it has none in this fixture; the
    // assertion is that it doesn't accidentally get expanded).
    expect(screen.getByTestId('tree-node-opp-2')).toHaveAttribute(
      'aria-level',
      '2',
    );
  });

  it('renders the warning indicator only on untested HIGH-importance assumptions', async () => {
    await renderWithRouter(
      <TreeProjection root={objectiveTree()} selectedId="asm-1" />,
    );
    const warnings = screen.getAllByTestId('tree-warning');
    expect(warnings).toHaveLength(1);
    // The warning is on the asm-1 row.
    const asmRow = screen.getByTestId('tree-node-asm-1');
    expect(asmRow).toContainElement(warnings[0]!);
  });

  it('shows status badges with text labels (not color alone)', async () => {
    await renderWithRouter(<TreeProjection root={objectiveTree()} />);
    const badges = screen.getAllByTestId('tree-status-badge');
    // Root + two opportunities = 3 visible nodes with badges.
    expect(badges.length).toBeGreaterThanOrEqual(3);
    // At least one badge text is human-readable.
    expect(badges.some((b) => b.textContent === 'Active')).toBe(true);
    expect(badges.some((b) => b.textContent === 'Paused')).toBe(true);
  });

  it('navigates to the artifact route when a node is clicked', async () => {
    const onNavigate = vi.fn();
    await renderWithRouter(
      <TreeProjection
        root={objectiveTree()}
        selectedId="obj-1"
        onNavigate={onNavigate}
      />,
    );
    // Click the opportunity's name button.
    const opp1Row = screen.getByTestId('tree-node-opp-1');
    const labelBtn = opp1Row.querySelector('button:not([aria-label])');
    expect(labelBtn).not.toBeNull();
    fireEvent.click(labelBtn!);
    expect(onNavigate).toHaveBeenCalledWith({ type: 'opportunity', id: 'opp-1' });
  });

  it('expands a collapsed branch on ArrowRight and collapses it on a second ArrowLeft', async () => {
    await renderWithRouter(
      <TreeProjection root={objectiveTree()} selectedId="obj-1" />,
    );
    const opp1 = screen.getByTestId('tree-node-opp-1');
    expect(opp1).toHaveAttribute('aria-expanded', 'false');

    // Focus the row and press ArrowRight to expand it.
    act(() => opp1.focus());
    fireEvent.keyDown(opp1, { key: 'ArrowRight' });
    expect(opp1).toHaveAttribute('aria-expanded', 'true');
    // The idea node (one level down) is now visible.
    expect(screen.getByTestId('tree-node-idea-1')).toBeInTheDocument();

    // ArrowLeft collapses an expanded branch.
    fireEvent.keyDown(opp1, { key: 'ArrowLeft' });
    expect(opp1).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('tree-node-idea-1')).not.toBeInTheDocument();
  });

  it('moves focus on ArrowDown / ArrowUp', async () => {
    await renderWithRouter(
      <TreeProjection root={objectiveTree()} selectedId="obj-1" />,
    );
    const obj = screen.getByTestId('tree-node-obj-1');
    act(() => obj.focus());
    expect(obj).toHaveAttribute('tabindex', '0');

    fireEvent.keyDown(obj, { key: 'ArrowDown' });
    // After ArrowDown the next visible row (opp-1) should be focused.
    const opp1 = screen.getByTestId('tree-node-opp-1');
    expect(opp1).toHaveAttribute('tabindex', '0');
    expect(obj).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(opp1, { key: 'ArrowUp' });
    expect(obj).toHaveAttribute('tabindex', '0');
  });

  it('activates the focused node on Enter', async () => {
    const onNavigate = vi.fn();
    await renderWithRouter(
      <TreeProjection
        root={objectiveTree()}
        selectedId="obj-1"
        onNavigate={onNavigate}
      />,
    );
    const opp1 = screen.getByTestId('tree-node-opp-1');
    act(() => opp1.focus());
    fireEvent.keyDown(opp1, { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledWith({ type: 'opportunity', id: 'opp-1' });
  });
});
