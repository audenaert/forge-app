import { Link } from '@tanstack/react-router';
import type { CSSProperties, ReactNode } from 'react';
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

// Shared visual + a11y attributes for every artifact link variant. Pulled
// out so the per-type Link elements stay focused on the typed `to`/`params`
// shape that TanStack Router's compile-time checks care about.
const linkClassName =
  'group inline-flex items-center gap-2 rounded-sm px-1 py-0.5 text-sm underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2';

// CSS custom property passthrough for the focus ring. CSSProperties
// doesn't model `--*` vars, so we cast the literal object once here
// rather than scattering escape hatches across every call site.
const linkStyle: CSSProperties = {
  color: 'var(--text-primary)',
  ['--tw-ring-color' as never]: 'var(--border-focus)',
};

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

  const inner: ReactNode = (
    <>
      <ArtifactTypeIcon type={type} aria-hidden="true" />
      <span className="font-medium">{name}</span>
      {statusLabel && <StatusBadge type={type} status={status ?? ''} />}
    </>
  );

  const sharedProps = {
    'aria-label': accessibleName,
    'data-artifact-type': type,
    'data-artifact-id': id,
    className: linkClassName,
    style: linkStyle,
  } as const;

  // Five fixed artifact types, five typed <Link> elements. Dispatching
  // through a switch instead of a runtime-constructed path keeps full
  // type checking on `to`/`params`, lets TanStack Router handle param
  // encoding, and removes the `as any` escape hatch.
  switch (type) {
    case 'objective':
      return (
        <Link to="/objective/$id" params={{ id }} {...sharedProps}>
          {inner}
        </Link>
      );
    case 'opportunity':
      return (
        <Link to="/opportunity/$id" params={{ id }} {...sharedProps}>
          {inner}
        </Link>
      );
    case 'idea':
      return (
        <Link to="/idea/$id" params={{ id }} {...sharedProps}>
          {inner}
        </Link>
      );
    case 'assumption':
      return (
        <Link to="/assumption/$id" params={{ id }} {...sharedProps}>
          {inner}
        </Link>
      );
    case 'experiment':
      return (
        <Link to="/experiment/$id" params={{ id }} {...sharedProps}>
          {inner}
        </Link>
      );
  }
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
