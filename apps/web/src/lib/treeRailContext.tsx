import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { TreeNode, UnrootedEntry } from './treeProjection';

/**
 * Shape of an active tree projection — the loaded subgraph plus the
 * metadata the AppShell needs to decide whether to render the rail and
 * which node is currently selected.
 *
 * Promoted to React state (rather than module-scoped) so React renders
 * react to changes; the project does not yet pull in a state library.
 */
export interface ActiveTreeProjection {
  /** The kind of root the user opened the projection on. */
  rootType: 'objective' | 'opportunity';
  /** The id of the root node — used for highlight + "still in subgraph" checks. */
  rootId: string;
  /** Normalized tree, ready for the renderer. */
  root: TreeNode;
  /** Entries for the "Unrooted at this level" disclosure. */
  unrooted: UnrootedEntry[];
  /** Section heading shown above the disclosure (e.g. "Unrooted opportunities"). */
  unrootedLabel: string;
  /** Empty-state message when there are no unrooted entries. */
  unrootedEmptyMessage: string;
}

interface TreeRailContextValue {
  active: ActiveTreeProjection | null;
  /**
   * Install (or replace) the active projection. Tree route components call
   * this in an effect when the route mounts. Calling with `null` clears
   * the rail.
   */
  setActive(next: ActiveTreeProjection | null): void;
}

const noop = () => {};

const TreeRailContext = createContext<TreeRailContextValue>({
  active: null,
  setActive: noop,
});

/**
 * Provider mounted at the root layout. Owns the `active` slot and exposes
 * `setActive` to the tree-route components downstream.
 *
 * The context survives navigation between sibling routes — that's the
 * whole point: clicking an idea node inside `/tree/objective/X` leaves the
 * tree route for `/idea/Y`, and the AppShell needs to keep showing the
 * loaded subgraph during that navigation. If `Y` is part of the loaded
 * subgraph, the rail stays; if not, the AppShell should clear the rail
 * (handled at the consumer level so the policy lives next to the layout).
 */
export function TreeRailProvider({ children }: { children: ReactNode }) {
  const [active, setActiveState] = useState<ActiveTreeProjection | null>(null);

  const setActive = useCallback((next: ActiveTreeProjection | null) => {
    // Reference-equal updates to the same root are no-ops to avoid
    // re-render storms when a tree route re-mounts on every param change.
    setActiveState((prev) => {
      if (
        prev &&
        next &&
        prev.rootType === next.rootType &&
        prev.rootId === next.rootId &&
        prev.root === next.root &&
        prev.unrooted === next.unrooted
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const value = useMemo<TreeRailContextValue>(
    () => ({ active, setActive }),
    [active, setActive],
  );

  return <TreeRailContext.Provider value={value}>{children}</TreeRailContext.Provider>;
}

export function useTreeRail(): TreeRailContextValue {
  return useContext(TreeRailContext);
}
