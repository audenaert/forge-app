import { useId, useState, type ReactNode } from 'react';
import { ArtifactLink } from '../artifact/ArtifactLink';
import type { ArtifactType } from '../../lib/enums';

export interface OrphanEntry {
  id: string;
  name: string;
  status?: string | null;
}

interface OrphanSectionProps {
  /** Stable anchor id — referenced by in-page scroll warnings in HealthBar. */
  anchorId: string;
  /** Visible section title, e.g. "Opportunities not supporting an objective". */
  title: string;
  /** Artifact type for the entries — drives ArtifactLink type/icon/label. */
  type: ArtifactType;
  entries: readonly OrphanEntry[];
  /** Optional helper text below the heading — explains what the section means. */
  description?: ReactNode;
}

/**
 * Collapsible disclosure section for a bucket of orphaned artifacts. The
 * spec insists these are first-class navigable surfaces, not hidden warning
 * banners — so even an empty section renders its heading with a one-line
 * "None" state instead of disappearing. That way users learn to look here.
 *
 * Accessibility:
 *   - The disclosure is a `<button>` with `aria-expanded` and
 *     `aria-controls` pointing at the list.
 *   - The heading is keyboard-focusable (`tabIndex={-1}`) so the HealthBar's
 *     in-page warning links can move focus into the section after scrolling.
 *   - Empty state copy is part of the normal flow, not announced as a
 *     separate live region — this is a static page, not a streaming one.
 */
export function OrphanSection({
  anchorId,
  title,
  type,
  entries,
  description,
}: OrphanSectionProps) {
  const [open, setOpen] = useState(true);
  const panelId = useId();

  return (
    <section
      id={anchorId}
      aria-labelledby={`${anchorId}-heading`}
      className="px-8 py-4"
      style={{ borderTop: '1px solid var(--border-default)' }}
    >
      <div className="flex items-baseline gap-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
          data-testid={`orphan-toggle-${anchorId}`}
          className="inline-flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2"
          style={{
            color: 'var(--text-primary)',
            // @ts-expect-error — CSS custom property passthrough for focus ring
            '--tw-ring-color': 'var(--border-focus)',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              color: 'var(--text-tertiary)',
              display: 'inline-block',
              width: '1rem',
              textAlign: 'center',
            }}
          >
            {open ? '▾' : '▸'}
          </span>
          <h3
            id={`${anchorId}-heading`}
            data-orphan-heading
            tabIndex={-1}
            className="text-sm"
            style={{ fontWeight: 600 }}
          >
            {title}
          </h3>
        </button>
        <span
          className="text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {entries.length}
        </span>
      </div>

      {description && (
        <p
          className="mt-1 ml-7 text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {description}
        </p>
      )}

      <div id={panelId} hidden={!open}>
        {entries.length === 0 ? (
          <p
            data-testid={`orphan-empty-${anchorId}`}
            className="mt-2 ml-7 text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            None
          </p>
        ) : (
          <ul className="mt-2 ml-7 flex flex-col gap-1">
            {entries.map((entry) => (
              <li key={entry.id}>
                <ArtifactLink
                  type={type}
                  id={entry.id}
                  name={entry.name}
                  status={entry.status}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
