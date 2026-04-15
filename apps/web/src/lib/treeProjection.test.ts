import { describe, it, expect } from 'vitest';
import {
  ancestorPath,
  allNodes,
  isUntestedHighImportance,
  projectObjectiveSubgraph,
  projectOpportunitySubgraph,
  visibleNodes,
  type TreeNode,
} from './treeProjection';

const objectiveSubgraph = {
  __typename: 'Query' as const,
  objectiveSubgraph: {
    __typename: 'ObjectiveSubgraphResult' as const,
    id: 'obj-1',
    name: 'Accelerate discovery',
    status: 'ACTIVE',
    opportunities: [
      {
        __typename: 'OpportunityWithIdeas' as const,
        id: 'opp-1',
        name: 'Teams have no model',
        status: 'ACTIVE',
        hmw: null,
        ideas: [
          {
            __typename: 'IdeaWithAssumptions' as const,
            id: 'idea-1',
            name: 'Graph store',
            status: 'BUILDING',
            assumptions: [
              {
                __typename: 'AssumptionWithExperiments' as const,
                id: 'asm-1',
                name: 'Neo4j handles patterns',
                status: 'VALIDATED',
                importance: 'HIGH',
                evidence: 'HIGH',
                experiments: [
                  {
                    __typename: 'ExperimentSummary' as const,
                    id: 'exp-1',
                    name: '@cypher spike',
                    status: 'COMPLETE',
                    method: null,
                    result: 'VALIDATED',
                  },
                ],
              },
              {
                __typename: 'AssumptionWithExperiments' as const,
                id: 'asm-2',
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
    ],
  },
};

describe('projectObjectiveSubgraph', () => {
  it('flattens an objective subgraph into a TreeNode tree', () => {
    const tree = projectObjectiveSubgraph(objectiveSubgraph as never);
    expect(tree).not.toBeNull();
    expect(tree!.type).toBe('objective');
    expect(tree!.id).toBe('obj-1');
    expect(tree!.children).toHaveLength(1);

    const opp = tree!.children[0]!;
    expect(opp.type).toBe('opportunity');
    expect(opp.id).toBe('opp-1');

    const idea = opp.children[0]!;
    expect(idea.type).toBe('idea');
    expect(idea.children).toHaveLength(2);

    const validated = idea.children[0]!;
    expect(validated.type).toBe('assumption');
    expect(validated.importance).toBe('HIGH');
    expect(validated.children[0]!.type).toBe('experiment');
  });

  it('returns null when the subgraph response has no objective', () => {
    expect(projectObjectiveSubgraph(undefined)).toBeNull();
    expect(
      projectObjectiveSubgraph({ objectiveSubgraph: null } as never),
    ).toBeNull();
  });
});

describe('projectOpportunitySubgraph', () => {
  it('flattens an opportunity subgraph into a TreeNode tree rooted at the opportunity', () => {
    const opportunitySubgraph = {
      opportunitySubgraph: {
        id: 'opp-9',
        name: 'Standalone',
        status: 'ACTIVE',
        hmw: 'HMW?',
        ideas: [
          {
            id: 'idea-9',
            name: 'A',
            status: 'DRAFT',
            assumptions: [],
          },
        ],
      },
    };
    const tree = projectOpportunitySubgraph(opportunitySubgraph as never);
    expect(tree!.type).toBe('opportunity');
    expect(tree!.children[0]!.type).toBe('idea');
  });

  it('returns null when the response is empty', () => {
    expect(projectOpportunitySubgraph(undefined)).toBeNull();
  });
});

describe('ancestorPath', () => {
  const tree: TreeNode = {
    type: 'objective',
    id: 'a',
    name: 'A',
    status: null,
    children: [
      {
        type: 'opportunity',
        id: 'b',
        name: 'B',
        status: null,
        children: [
          { type: 'idea', id: 'c', name: 'C', status: null, children: [] },
        ],
      },
      { type: 'opportunity', id: 'd', name: 'D', status: null, children: [] },
    ],
  };

  it('returns the inclusive path from root to target', () => {
    expect(ancestorPath(tree, 'c')).toEqual(['a', 'b', 'c']);
    expect(ancestorPath(tree, 'd')).toEqual(['a', 'd']);
    expect(ancestorPath(tree, 'a')).toEqual(['a']);
  });

  it('returns the empty array when the target is not in the tree', () => {
    expect(ancestorPath(tree, 'zzz')).toEqual([]);
  });
});

describe('visibleNodes', () => {
  const tree: TreeNode = {
    type: 'objective',
    id: 'a',
    name: 'A',
    status: null,
    children: [
      {
        type: 'opportunity',
        id: 'b',
        name: 'B',
        status: null,
        children: [
          { type: 'idea', id: 'c', name: 'C', status: null, children: [] },
        ],
      },
    ],
  };

  it('hides children of collapsed branches', () => {
    expect(visibleNodes(tree, new Set()).map((n) => n.id)).toEqual(['a']);
  });

  it('includes children when the branch is expanded', () => {
    expect(visibleNodes(tree, new Set(['a', 'b'])).map((n) => n.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});

describe('isUntestedHighImportance', () => {
  it('flags assumptions that are HIGH and UNTESTED', () => {
    const node: TreeNode = {
      type: 'assumption',
      id: 'x',
      name: 'X',
      status: 'UNTESTED',
      importance: 'HIGH',
      children: [],
    };
    expect(isUntestedHighImportance(node)).toBe(true);
  });

  it('does not flag validated or low-importance assumptions', () => {
    expect(
      isUntestedHighImportance({
        type: 'assumption',
        id: 'x',
        name: 'X',
        status: 'VALIDATED',
        importance: 'HIGH',
        children: [],
      }),
    ).toBe(false);
    expect(
      isUntestedHighImportance({
        type: 'assumption',
        id: 'x',
        name: 'X',
        status: 'UNTESTED',
        importance: 'LOW',
        children: [],
      }),
    ).toBe(false);
  });

  it('does not flag non-assumption types', () => {
    expect(
      isUntestedHighImportance({
        type: 'idea',
        id: 'x',
        name: 'X',
        status: 'DRAFT',
        children: [],
      }),
    ).toBe(false);
  });
});

describe('allNodes', () => {
  it('walks the whole tree regardless of expansion state', () => {
    const tree: TreeNode = {
      type: 'objective',
      id: 'a',
      name: 'A',
      status: null,
      children: [
        {
          type: 'opportunity',
          id: 'b',
          name: 'B',
          status: null,
          children: [
            { type: 'idea', id: 'c', name: 'C', status: null, children: [] },
          ],
        },
      ],
    };
    expect(allNodes(tree).map((n) => n.id).sort()).toEqual(['a', 'b', 'c']);
  });
});
