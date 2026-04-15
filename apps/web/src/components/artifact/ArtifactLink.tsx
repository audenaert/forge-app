import { Link } from '@tanstack/react-router';
import {
  type ArtifactType,
  labelForArtifactType,
  labelForStatus,
} from '../../lib/enums';
import { ArtifactTypeIcon } from './ArtifactTypeIcon';

export interface ArtifactLinkProps {
  type: ArtifactType;
  id: string;
  name: string;
  status?: string | null;
}

/**
 * Canonical way to render a link to another artifact. The header of every
 * artifact page, every RelationshipList entry, every tree-rail node, every
 * dashboard list item — all of them route through this primitive. If a link
 * to an artifact is rendered anywhere with a hand-rolled <a>, something is
 * wrong.
 *
 * Visual: type icon + name + status badge, all inside a single interactive
 * target. The accessible name collapses to "<Type>: <Name>, status <Status>"
 * via aria-label, so screen readers announce the type and status alongside
 * the artifact name. The visual layout keeps the icon decorative
 * (aria-hidden) — the type is already in the accessible name.
 *
 * Navigation uses TanStack Router's <Link> so client-side transitions happen
 * without a document reload and without fighting the router's scroll
 * restoration. The generated route path is computed from the artifact type.
 */
export function ArtifactLink({ type, id, name, status }: ArtifactLinkProps) {
  const typeLabel = labelForArtifactType(type);
  const statusLabel = labelForStatus(type, status);
  const accessibleName = statusLabel
    ? `${typeLabel}: ${name}, status ${statusLabel}`
    : `${typeLabel}: ${name}`;

  // TanStack Router's typed <Link> requires a literal `to` to do type
  // checks. Because each artifact type has its own registered route, we
  // pass the concrete path at runtime as a plain string — it resolves
  // through the router's runtime matcher, which doesn't need the type
  // discrimination the compile-time variant enforces. This is the trade-
  // off for having a single primitive that works across all types.
  const routePath = `/${type}/${encodeURIComponent(id)}` as const;

  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={routePath as any}
      aria-label={accessibleName}
      data-artifact-type={type}
      data-artifact-id={id}
      className="group inline-flex items-center gap-2 rounded-sm px-1 py-0.5 text-sm underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2"
      style={{
        color: 'var(--text-primary)',
        // @ts-expect-error — CSS custom property passthrough for focus ring
        '--tw-ring-color': 'var(--border-focus)',
      }}
    >
      <ArtifactTypeIcon type={type} aria-hidden="true" />
      <span className="font-medium">{name}</span>
      {statusLabel && <StatusBadge type={type} status={status ?? ''} />}
    </Link>
  );
}

/**
 * Compact status badge used inside ArtifactLink (and ArtifactHeader). The
 * text label is always present — color alone is never the carrier of status
 * information, per the accessibility AC.
 */
export function StatusBadge({
  type,
  status,
}: {
  type: ArtifactType;
  status: string;
}) {
  const label = labelForStatus(type, status);
  if (!label) return null;
  return (
    <span
      data-testid="status-badge"
      data-status={status}
      className="inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs"
      style={{
        borderColor: 'var(--border-default)',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--color-surface-raised)',
      }}
    >
      {label}
    </span>
  );
}
