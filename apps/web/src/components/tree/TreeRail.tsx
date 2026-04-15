import type { ReactNode } from 'react';
import type { TreeNode, UnrootedEntry } from '../../lib/treeProjection';
import { ArtifactLink } from '../artifact/ArtifactLink';
import { TreeProjection } from './TreeProjection';

// Re-export so consumers in the components layer can grab the type from
// here without reaching into ../../lib. The canonical declaration lives in
// lib/treeProjection.ts to keep the lib layer self-contained.
export type { UnrootedEntry };

export interface TreeRailProps {
  /** Section heading for the tree (e.g. "Tree: Objective"). */
  heading: string;
  /** Normalized tree to render. */
  root: TreeNode;
  /** Currently-selected node id (route-derived, not internal state). */
  selectedId?: string | null;
  /**
   * Entries for the "Unrooted at this level" disclosure section. The label
   * for the section is type-dependent; the caller passes the rendered
   * heading as `unrootedLabel`.
   */
  unrooted: UnrootedEntry[];
  /** Heading shown above the unrooted entries (e.g. "Unrooted opportunities"). */
  unrootedLabel: string;
  /**
   * Empty-state message rendered inside the disclosure when there are no
   * unrooted entries. The disclosure stays visible — the absence of orphans
   * is itself information per the "Orphans as a feature" section.
   */
  unrootedEmptyMessage: string;
  /**
   * Optional slot for a small message rendered above the tree — used by the
   * route component to surface the projection's root name in larger type.
   */
  banner?: ReactNode;
}

/**
 * Sidebar-rail content for tree projection routes. Renders the projection
 * tree and the "Unrooted at this level" disclosure beneath it. The
 * disclosure uses a native `<details>` so it's keyboard- and screen-reader-
 * accessible without any custom widget code.
 */
export function TreeRail({
  heading,
  root,
  selectedId,
  unrooted,
  unrootedLabel,
  unrootedEmptyMessage,
  banner,
}: TreeRailProps) {
  return (
    <div
      data-testid="tree-rail"
      className="flex h-full flex-col gap-4 overflow-auto px-3 py-5"
    >
      <div
        className="px-2 text-[11px] font-semibold uppercase"
        style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}
      >
        {heading}
      </div>

      {banner}

      <TreeProjection root={root} selectedId={selectedId} />

      <details data-testid="tree-unrooted" className="px-2">
        <summary
          className="cursor-pointer text-xs font-semibold"
          style={{ color: 'var(--text-secondary)' }}
        >
          {unrootedLabel}
        </summary>
        {unrooted.length === 0 ? (
          <p
            data-testid="tree-unrooted-empty"
            className="mt-2 text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {unrootedEmptyMessage}
          </p>
        ) : (
          <ul data-testid="tree-unrooted-list" className="mt-2 flex flex-col gap-1">
            {unrooted.map((entry) => (
              <li key={`${entry.type}-${entry.id}`}>
                <ArtifactLink
                  type={entry.type}
                  id={entry.id}
                  name={entry.name}
                  status={entry.status}
                />
              </li>
            ))}
          </ul>
        )}
      </details>
    </div>
  );
}
