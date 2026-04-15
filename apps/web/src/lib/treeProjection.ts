import type { ArtifactType } from './enums';
import type {
  ObjectiveSubgraphQuery,
  OpportunitySubgraphQuery,
} from './graphql/generated/graphql';

/**
 * Normalized tree node shape consumed by the <TreeProjection> renderer.
 *
 * Both ObjectiveSubgraph and OpportunitySubgraph return type-specific nested
 * shapes from the API. The component should not need to know about either —
 * it walks a single recursive structure with a discriminating `type` and a
 * uniform `children` field. The projector functions in this module flatten
 * both schema shapes into this form.
 *
 * Only the fields needed for tree rendering are carried here: `id` and
 * `name` for display, `status` for the trailing badge, plus the
 * assumption-specific `importance` so the renderer can show the warning
 * indicator on untested HIGH-importance assumptions without re-walking the
 * source data. `body` is intentionally excluded — bodies live on detail
 * queries fired when a node is opened, not in the subgraph payload.
 */
/**
 * Entry in an "Unrooted at this level" disclosure section. Lives next to
 * TreeNode because both the rail context and the rail component need to
 * reference the shape, and routing it through the component layer would
 * create a circular import (context → component → context).
 */
export interface UnrootedEntry {
  type: 'opportunity' | 'idea';
  id: string;
  name: string;
  status: string | null;
}

export interface TreeNode {
  type: ArtifactType;
  id: string;
  name: string;
  status: string | null;
  /** Only set on assumptions; undefined for every other type. */
  importance?: string | null;
  children: TreeNode[];
}

/**
 * Project an `objectiveSubgraph` query result into a TreeNode tree rooted at
 * the objective. Returns `null` when the query came back without an
 * objective (e.g. the id was not in the domain).
 */
export function projectObjectiveSubgraph(
  data: ObjectiveSubgraphQuery | undefined,
): TreeNode | null {
  const root = data?.objectiveSubgraph;
  if (!root) return null;
  return {
    type: 'objective',
    id: root.id,
    name: root.name,
    status: root.status,
    children: root.opportunities.map((opp) => ({
      type: 'opportunity' as const,
      id: opp.id,
      name: opp.name,
      status: opp.status,
      children: opp.ideas.map(projectIdea),
    })),
  };
}

/**
 * Project an `opportunitySubgraph` query result into a TreeNode tree rooted
 * at the opportunity. Returns `null` when the query came back without an
 * opportunity.
 */
export function projectOpportunitySubgraph(
  data: OpportunitySubgraphQuery | undefined,
): TreeNode | null {
  const root = data?.opportunitySubgraph;
  if (!root) return null;
  return {
    type: 'opportunity',
    id: root.id,
    name: root.name,
    status: root.status,
    children: root.ideas.map(projectIdea),
  };
}

/**
 * Shape of an idea node as it appears in either subgraph response. Both the
 * objective and opportunity queries select the same idea fields so we can
 * share one projector function via a structurally-typed parameter rather
 * than coupling to the generated query types directly.
 */
interface IdeaInput {
  id: string;
  name: string;
  status: string;
  assumptions: ReadonlyArray<{
    id: string;
    name: string;
    status: string;
    importance: string;
    experiments: ReadonlyArray<{
      id: string;
      name: string;
      status: string;
    }>;
  }>;
}

function projectIdea(idea: IdeaInput): TreeNode {
  return {
    type: 'idea',
    id: idea.id,
    name: idea.name,
    status: idea.status,
    children: idea.assumptions.map((assumption) => ({
      type: 'assumption' as const,
      id: assumption.id,
      name: assumption.name,
      status: assumption.status,
      importance: assumption.importance,
      children: assumption.experiments.map((exp) => ({
        type: 'experiment' as const,
        id: exp.id,
        name: exp.name,
        status: exp.status,
        children: [],
      })),
    })),
  };
}

/**
 * Walk the tree depth-first and return the IDs of every ancestor of the
 * node identified by `targetId`, inclusive of the target itself. Used by the
 * renderer to compute the default expansion state — only the selected
 * node's path is expanded, every other branch starts collapsed. If the
 * target is not present in the tree, returns the empty array (caller can
 * fall back to the root).
 */
export function ancestorPath(root: TreeNode, targetId: string): string[] {
  const path: string[] = [];
  const walked = walk(root, targetId, path);
  return walked ? path : [];
}

function walk(node: TreeNode, targetId: string, path: string[]): boolean {
  path.push(node.id);
  if (node.id === targetId) return true;
  for (const child of node.children) {
    if (walk(child, targetId, path)) return true;
  }
  path.pop();
  return false;
}

/**
 * Produce a flat, in-order list of every node in the tree, respecting the
 * passed `expanded` set so collapsed branches contribute only their root.
 * Used by the keyboard handler to compute previous/next focusable nodes.
 */
export function visibleNodes(root: TreeNode, expanded: ReadonlySet<string>): TreeNode[] {
  const out: TreeNode[] = [];
  visit(root, expanded, out);
  return out;
}

function visit(node: TreeNode, expanded: ReadonlySet<string>, out: TreeNode[]) {
  out.push(node);
  if (expanded.has(node.id)) {
    for (const child of node.children) {
      visit(child, expanded, out);
    }
  }
}

/**
 * `true` if the assumption should show a warning indicator: HIGH importance
 * and not yet validated. The single most important discovery-health signal
 * per the spec.
 */
export function isUntestedHighImportance(node: TreeNode): boolean {
  if (node.type !== 'assumption') return false;
  return node.importance === 'HIGH' && node.status === 'UNTESTED';
}

/**
 * Return every node in the tree (regardless of expansion state). Used by
 * the rail to determine whether the currently-routed artifact id is part of
 * the loaded subgraph — and so whether the rail should stay visible.
 */
export function allNodes(root: TreeNode): TreeNode[] {
  const out: TreeNode[] = [];
  function recur(n: TreeNode) {
    out.push(n);
    for (const c of n.children) recur(c);
  }
  recur(root);
  return out;
}
