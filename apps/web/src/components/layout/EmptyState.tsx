import type { ReactNode } from 'react';

interface EmptyStateProps {
  /** Primary heading — what state the user is looking at. */
  title: string;
  /** Supporting copy — what this space is for and how to populate it. */
  description: ReactNode;
  /**
   * Optional call-to-action slot. Typically a button or a link; rendered
   * under the description with a small gap.
   */
  action?: ReactNode;
}

/*
 * Generic zero-state. Used wherever a surface has nothing to show yet —
 * dashboard with no discovery data, filtered list with no matches,
 * artifact page with no relationships.
 *
 * Typography follows the gravitational hierarchy principle: title is the
 * dominant anchor (heavier weight), description is secondary, action is
 * offset below.
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-xl flex-col items-start gap-3 px-8 py-16"
    >
      <h2
        className="text-xl"
        style={{
          color: 'var(--text-primary)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      <div
        className="text-sm"
        style={{
          color: 'var(--text-secondary)',
          fontWeight: 400,
          lineHeight: 1.6,
        }}
      >
        {description}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
