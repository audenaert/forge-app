import type { ReactNode } from 'react';

interface AppShellProps {
  /** Navigation sidebar — always present. */
  sidebar: ReactNode;
  /**
   * Optional tree projection rail. Absent/empty in M1a — the rail shows up
   * in the `tree-projection-view` story. When undefined, the main content
   * expands to fill the remaining space.
   */
  treeRail?: ReactNode;
  /** Main content area — dashboard, artifact page, or empty state. */
  children: ReactNode;
}

/*
 * Three-region layout per the spec wireframe:
 *
 *   ┌──────────┬───────────────┬─────────────────────────┐
 *   │ Sidebar  │ Tree rail     │ Main content            │
 *   │ (fixed)  │ (optional)    │ (fills remainder)       │
 *   └──────────┴───────────────┴─────────────────────────┘
 *
 * Sidebar and tree rail share the canvas background — elevation is
 * expressed via `--border-default` separators, not a different surface
 * fill (see .interface-design/system.md "Depth Strategy" and "Navigation").
 */
export function AppShell({ sidebar, treeRail, children }: AppShellProps) {
  return (
    <div
      data-testid="app-shell"
      className="flex h-screen w-screen bg-surface-base text-deep"
    >
      <div
        data-testid="app-shell-sidebar"
        className="w-60 shrink-0"
        style={{ borderRight: '1px solid var(--border-default)' }}
      >
        {sidebar}
      </div>
      {treeRail !== undefined && treeRail !== null && (
        <div
          data-testid="app-shell-tree-rail"
          className="w-72 shrink-0"
          style={{ borderRight: '1px solid var(--border-default)' }}
        >
          {treeRail}
        </div>
      )}
      <main
        data-testid="app-shell-main"
        className="flex-1 overflow-auto"
      >
        {children}
      </main>
    </div>
  );
}
