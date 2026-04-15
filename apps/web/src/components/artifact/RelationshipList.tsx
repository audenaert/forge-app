import { ArtifactLink, type ArtifactLinkProps } from './ArtifactLink';

export interface RelationshipSection {
  /**
   * Human-readable label for this section — "Addresses", "Tested by",
   * "Supports", etc. Rendered as an h2 so the page has a proper heading
   * structure (h1 = artifact name, h2 = relationship sections).
   */
  label: string;
  items: ArtifactLinkProps[];
}

interface RelationshipListProps {
  sections: RelationshipSection[];
}

/**
 * The lateral navigation surface. Every typed relationship the artifact
 * participates in becomes a section here; every related artifact is an
 * ArtifactLink. Sections with zero items are rendered as an empty
 * placeholder so users can see "there are no assumptions on this idea yet"
 * rather than having the section silently disappear.
 *
 * There is no "upward" vs "downward" ordering baked in here — that decision
 * lives in the per-type wrapper, which builds the sections in whatever
 * order reads best for the type.
 */
export function RelationshipList({ sections }: RelationshipListProps) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <section
      data-testid="relationship-list"
      aria-label="Relationships"
      className="flex flex-col gap-6 pt-6"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      {sections.map((section) => (
        <div
          key={section.label}
          data-testid="relationship-section"
          data-relationship={section.label}
          className="flex flex-col gap-2"
        >
          <h2
            className="text-xs uppercase"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em', fontWeight: 600 }}
          >
            {section.label}
          </h2>
          {section.items.length === 0 ? (
            <div
              className="text-sm italic"
              style={{ color: 'var(--text-tertiary)' }}
              data-testid="relationship-empty"
            >
              None.
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {section.items.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <ArtifactLink {...item} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}
