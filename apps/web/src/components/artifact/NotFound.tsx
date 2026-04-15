import { Link } from '@tanstack/react-router';
import { EmptyState } from '../layout/EmptyState';
import {
  type ArtifactType,
  labelForArtifactType,
} from '../../lib/enums';

interface ArtifactNotFoundProps {
  type: ArtifactType;
  id: string;
}

/**
 * Rendered when a detail query resolves with an empty array for the
 * requested artifact id. The API answers "no such artifact in this domain"
 * by returning `objectives: []` (or `ideas: []`, etc.) rather than a 404,
 * because the server-side domain scoping deliberately hides artifacts in
 * other domains — the client can't distinguish "doesn't exist" from "not
 * yours", so the UI treats both the same way.
 */
export function ArtifactNotFound({ type, id }: ArtifactNotFoundProps) {
  const typeLabel = labelForArtifactType(type);
  return (
    <EmptyState
      title={`${typeLabel} not found`}
      description={
        <p>
          No {typeLabel.toLowerCase()} with id <code>{id}</code> is visible in
          this domain. It may not exist, or it may belong to a different
          domain.
        </p>
      }
      action={
        <Link
          to="/"
          className="text-sm underline underline-offset-2"
          style={{ color: 'var(--color-ocean)' }}
        >
          Go to dashboard
        </Link>
      }
    />
  );
}
