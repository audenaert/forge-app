import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
  type KeyboardEvent,
  type ReactElement,
} from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  ancestorPath,
  isUntestedHighImportance,
  visibleNodes,
  type TreeNode,
} from '../../lib/treeProjection';
import { labelForStatus, type ArtifactType } from '../../lib/enums';
import { ArtifactTypeIcon } from '../artifact/ArtifactTypeIcon';

export interface TreeProjectionProps {
  /** Root of the projection. Always present — empty subgraphs short-circuit before this. */
  root: TreeNode;
  /**
   * The id of the currently-selected node, derived from the route params
   * upstream. Drives the highlight; if no match exists in the tree the
   * highlight collapses (the route is considered "outside the subgraph").
   */
  selectedId?: string | null;
  /**
   * Test seam: navigation handler. Defaults to TanStack Router's
   * `useNavigate` so production traffic goes through the typed router and
   * tests can pass a spy. Always called with the same shape regardless of
   * the artifact type so the test does not need to know about the URL
   * structure.
   */
  onNavigate?: (target: { type: ArtifactType; id: string }) => void;
}

/**
 * The indented, expandable tree rendered in the AppShell's left rail when
 * the user is inside a tree projection.
 *
 * Visual encoding follows the spec:
 *   - leading type icon (◆ ◇ ⚪ ? ⚗) — never color alone
 *   - trailing status text badge
 *   - warning indicator on untested HIGH-importance assumptions
 *   - depth communicated by indentation
 *
 * Accessibility:
 *   - container is `role="tree"` with an aria-label
 *   - every node is `role="treeitem"` with `aria-level`, `aria-expanded`
 *     (only set on branches with children), and `aria-selected`
 *   - exactly one node is in the tab order at a time (`tabIndex={0}`)
 *     so Tab moves focus out of the rail rather than walking through every
 *     visible node — Arrow keys move focus inside the tree
 *   - Arrow Up / Down move focus to the previous / next visible node
 *   - Arrow Right expands a collapsed branch or moves to its first child
 *   - Arrow Left collapses an expanded branch or moves to its parent
 *   - Enter activates the focused node, navigating to its artifact page
 *   - prefers-reduced-motion is respected because there are no transitions
 *     on expand/collapse: state flips render the new layout instantly.
 */
export function TreeProjection({ root, selectedId, onNavigate }: TreeProjectionProps) {
  const navigate = useNavigate();
  const handleNavigate = useCallback(
    (target: { type: ArtifactType; id: string }) => {
      if (onNavigate) {
        onNavigate(target);
        return;
      }
      // Cast: TanStack Router's typed Link wants a literal `to`. The runtime
      // resolver accepts any registered route path. ArtifactLink uses the
      // same trick — see its inline comment for the rationale.
      const path = `/${target.type}/${encodeURIComponent(target.id)}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigate({ to: path as any });
    },
    [navigate, onNavigate],
  );

  // Default-expanded set: the ancestor path of the selected node, falling
  // back to just the root if there's no selection or the selection isn't
  // in the tree. Sibling branches start collapsed per the AC.
  const initialExpanded = useMemo(() => {
    if (selectedId) {
      const path = ancestorPath(root, selectedId);
      if (path.length > 0) return new Set(path);
    }
    return new Set<string>([root.id]);
  }, [root, selectedId]);

  // Expansion state is preserved across selection changes within the same
  // projection. We keep a ref to detect when the *root* identity changes
  // (a different subgraph) and reset; selection changes alone do not reset.
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);
  const lastRootId = useRef(root.id);
  useEffect(() => {
    if (lastRootId.current !== root.id) {
      lastRootId.current = root.id;
      setExpanded(initialExpanded);
    }
  }, [root.id, initialExpanded]);

  // When a *new* selection arrives (inside the same root), expand its
  // ancestor path so it's visible — but don't collapse anything else.
  useEffect(() => {
    if (!selectedId) return;
    const path = ancestorPath(root, selectedId);
    if (path.length === 0) return;
    setExpanded((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const id of path) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [root, selectedId]);

  // Focus management: track which node is currently focused. Defaults to
  // the selected node, falling back to the root. Tab moves focus out of
  // the rail because only the focused node has tabIndex=0.
  const [focusedId, setFocusedId] = useState<string>(() => selectedId ?? root.id);
  useEffect(() => {
    if (selectedId) setFocusedId(selectedId);
  }, [selectedId]);

  const flat = useMemo(() => visibleNodes(root, expanded), [root, expanded]);
  const parentOf = useMemo(() => buildParentMap(root), [root]);

  // Refs into the rendered DOM nodes so we can imperatively focus on
  // arrow-key navigation. Keyed by node id.
  const nodeRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const setNodeRef = useCallback(
    (id: string, el: HTMLDivElement | null) => {
      nodeRefs.current.set(id, el);
    },
    [],
  );

  const focusNode = useCallback((id: string) => {
    setFocusedId(id);
    // Defer to the next microtask so the new tabIndex is committed before
    // we call .focus(), otherwise the browser may refuse the focus call
    // on a node that still has tabIndex={-1}.
    queueMicrotask(() => {
      nodeRefs.current.get(id)?.focus();
    });
  }, []);

  const toggle = useCallback((id: string, open: boolean) => {
    setExpanded((prev) => {
      const has = prev.has(id);
      if (open && has) return prev;
      if (!open && !has) return prev;
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, node: TreeNode) => {
      const idx = flat.findIndex((n) => n.id === node.id);
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const nextNode = flat[idx + 1];
          if (nextNode) focusNode(nextNode.id);
          return;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const prevNode = flat[idx - 1];
          if (prevNode) focusNode(prevNode.id);
          return;
        }
        case 'ArrowRight': {
          event.preventDefault();
          if (node.children.length === 0) return;
          if (!expanded.has(node.id)) {
            toggle(node.id, true);
          } else {
            // Already expanded — move focus to the first child.
            focusNode(node.children[0]!.id);
          }
          return;
        }
        case 'ArrowLeft': {
          event.preventDefault();
          if (node.children.length > 0 && expanded.has(node.id)) {
            toggle(node.id, false);
          } else {
            const parent = parentOf.get(node.id);
            if (parent) focusNode(parent);
          }
          return;
        }
        case 'Enter': {
          event.preventDefault();
          handleNavigate({ type: node.type, id: node.id });
          return;
        }
        default:
          return;
      }
    },
    [flat, expanded, parentOf, toggle, focusNode, handleNavigate],
  );

  return (
    <div
      role="tree"
      aria-label="Discovery tree projection"
      data-testid="tree-projection"
      className="text-sm"
    >
      {renderNodeWithChildren({
        node: root,
        depth: 0,
        expanded,
        focusedId,
        selectedId: selectedId ?? null,
        onToggle: toggle,
        onNavigate: handleNavigate,
        onKeyDown,
        setNodeRef,
        onFocus: setFocusedId,
      })}
    </div>
  );
}

interface RenderArgs {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  focusedId: string;
  selectedId: string | null;
  onToggle(id: string, open: boolean): void;
  onNavigate(target: { type: ArtifactType; id: string }): void;
  onKeyDown(event: KeyboardEvent<HTMLDivElement>, node: TreeNode): void;
  setNodeRef(id: string, el: HTMLDivElement | null): void;
  onFocus(id: string): void;
}

function renderNode(args: RenderArgs) {
  const {
    node,
    depth,
    expanded,
    focusedId,
    selectedId,
    onToggle,
    onNavigate,
    onKeyDown,
    setNodeRef,
    onFocus,
  } = args;

  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const isFocused = focusedId === node.id;
  const showWarning = isUntestedHighImportance(node);
  const statusLabel = labelForStatus(node.type, node.status);

  return (
    <div
      key={node.id}
      role="treeitem"
      aria-level={depth + 1}
      aria-expanded={hasChildren ? isOpen : undefined}
      aria-selected={isSelected}
      tabIndex={isFocused ? 0 : -1}
      ref={(el) => setNodeRef(node.id, el)}
      data-testid={`tree-node-${node.id}`}
      data-artifact-type={node.type}
      data-selected={isSelected ? 'true' : undefined}
      onKeyDown={(e) => onKeyDown(e, node)}
      onFocus={() => onFocus(node.id)}
      className="flex items-center gap-2 rounded-sm py-1 pr-2 outline-none focus-visible:ring-2"
      style={{
        paddingLeft: `${depth * 16 + 8}px`,
        backgroundColor: isSelected
          ? 'var(--color-surface-raised)'
          : 'transparent',
        // @ts-expect-error — CSS custom property passthrough
        '--tw-ring-color': 'var(--border-focus)',
      }}
    >
      {hasChildren ? (
        <button
          type="button"
          aria-label={isOpen ? 'Collapse' : 'Expand'}
          aria-hidden="true"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id, !isOpen);
          }}
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {isOpen ? '▾' : '▸'}
        </button>
      ) : (
        // Spacer so leaves align with branch labels. aria-hidden because
        // it carries no information.
        <span aria-hidden="true" className="inline-block h-4 w-4 shrink-0" />
      )}

      <ArtifactTypeIcon type={node.type} aria-hidden="true" />

      <button
        type="button"
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
          onNavigate({ type: node.type, id: node.id });
        }}
        className="flex-1 truncate text-left"
        style={{ color: 'var(--text-primary)' }}
      >
        {node.name}
      </button>

      {showWarning && (
        <span
          role="img"
          aria-label="Untested high-importance assumption"
          data-testid="tree-warning"
          className="text-xs"
          style={{ color: 'var(--text-secondary)' }}
        >
          ⚠
        </span>
      )}

      {statusLabel && (
        <span
          data-testid="tree-status-badge"
          data-status={node.status ?? ''}
          className="ml-auto inline-flex shrink-0 items-center rounded-sm border px-1.5 text-[11px]"
          style={{
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--color-surface-raised)',
          }}
        >
          {statusLabel}
        </span>
      )}
    </div>
  );
}

/**
 * Build a map from child id -> parent id so the keyboard handler can find
 * a node's parent in O(1) when the user presses Left.
 */
function buildParentMap(root: TreeNode): Map<string, string> {
  const map = new Map<string, string>();
  function recur(node: TreeNode) {
    for (const child of node.children) {
      map.set(child.id, node.id);
      recur(child);
    }
  }
  recur(root);
  return map;
}

/**
 * Render a node and (if it is expanded) recursively render its children.
 * Kept separate from `renderNode` so the per-row JSX stays readable and the
 * recursion is concentrated in a single, four-line function.
 */
function renderNodeWithChildren(args: RenderArgs): ReactElement {
  const { node, depth, expanded } = args;
  return (
    <Fragment key={node.id}>
      {renderNode(args)}
      {expanded.has(node.id) &&
        node.children.map((child) =>
          renderNodeWithChildren({ ...args, node: child, depth: depth + 1 }),
        )}
    </Fragment>
  );
}
