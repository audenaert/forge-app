import type { ReactNode } from 'react';
import { type ArtifactType, labelForArtifactType } from '../../lib/enums';
import { ArtifactTypeIcon } from './ArtifactTypeIcon';
import { StatusBadge } from './ArtifactLink';

export interface ArtifactMetadataItem {
  label: string;
  value: ReactNode;
}

interface ArtifactHeaderProps {
  type: ArtifactType;
  name: string;
  status: string;
  /**
   * Type-specific metadata fields. Each wrapper component decides what goes
   * here — `hmw` for Opportunity, importance/evidence for Assumption, etc.
   * createdAt / updatedAt are always included (appended by the shell).
   */
  metadata?: ArtifactMetadataItem[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

function formatTimestamp(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Header block for an artifact page.
 *
 * Gravitational hierarchy: the artifact name is the dominant anchor (h1,
 * heavier weight), the type icon + status badge flank it as secondary
 * context, and metadata fields sit beneath in a compact two-column list.
 * createdAt/updatedAt are always present because they're on every type.
 *
 * The h1 is the page heading — exactly one per artifact page. The a11y AC
 * pins this: "artifact name is the page h1".
 */
export function ArtifactHeader({
  type,
  name,
  status,
  metadata = [],
  createdAt,
  updatedAt,
}: ArtifactHeaderProps) {
  const typeLabel = labelForArtifactType(type);

  return (
    <header className="flex flex-col gap-4 pb-6" data-testid="artifact-header">
      <div className="flex items-center gap-2 text-xs uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
        <ArtifactTypeIcon type={type} aria-hidden="true" />
        <span>{typeLabel}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <h1
          className="text-2xl"
          style={{ color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '-0.01em' }}
        >
          {name}
        </h1>
        <StatusBadge type={type} status={status} />
      </div>
      <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {metadata.map((item) => (
          <MetadataRow key={item.label} label={item.label} value={item.value} />
        ))}
        <MetadataRow label="Created" value={formatTimestamp(createdAt)} />
        <MetadataRow label="Updated" value={formatTimestamp(updatedAt)} />
      </dl>
    </header>
  );
}

function MetadataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <>
      <dt style={{ color: 'var(--text-tertiary)' }}>{label}</dt>
      <dd style={{ color: 'var(--text-secondary)' }}>{value ?? '—'}</dd>
    </>
  );
}
