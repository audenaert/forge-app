import type { ArtifactType } from '../../lib/enums';

interface ArtifactTypeIconProps {
  type: ArtifactType;
  /**
   * When set to "true", the icon is hidden from assistive technology. The
   * component uses the ASCII glyphs specified in the spec (◆ ◇ ⚪ ? ⚗) —
   * these are decorative because the artifact type label always appears
   * alongside the icon (either in text or in the aria-label).
   */
  'aria-hidden'?: 'true' | 'false' | boolean;
}

// Glyph choices come from the spec's "Tree projection" visual encoding
// table. Type identity is communicated by icon + text together, never by
// color alone, so WCAG 1.4.1 (Use of Color) is satisfied.
const GLYPHS: Record<ArtifactType, string> = {
  objective: '◆',
  opportunity: '◇',
  idea: '⚪',
  assumption: '?',
  experiment: '⚗',
};

export function ArtifactTypeIcon({ type, ...rest }: ArtifactTypeIconProps) {
  return (
    <span
      data-testid="artifact-type-icon"
      data-artifact-type={type}
      className="inline-block w-4 text-center text-sm leading-none"
      style={{ color: 'var(--text-secondary)' }}
      {...rest}
    >
      {GLYPHS[type]}
    </span>
  );
}
