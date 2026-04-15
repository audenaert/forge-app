import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArtifactBodyProps {
  body: string | null | undefined;
}

/**
 * Renders the markdown body of an artifact.
 *
 * Content is read-only and trusted (authored by the team via Claude Code or
 * the API), so no extra sanitizer runs — react-markdown disallows raw HTML
 * by default and we keep that default. GFM extensions (tables, task lists,
 * strikethrough) are enabled via remark-gfm.
 *
 * The body is wrapped in a Tailwind `prose`-style scope implemented directly
 * on this component so we don't depend on @tailwindcss/typography yet.
 * Typography follows the design token set — no hard-coded colors.
 */
export function ArtifactBody({ body }: ArtifactBodyProps) {
  if (!body || body.trim().length === 0) {
    return (
      <div
        data-testid="artifact-body-empty"
        className="py-4 text-sm italic"
        style={{ color: 'var(--text-tertiary)' }}
      >
        No body text.
      </div>
    );
  }

  return (
    <div
      data-testid="artifact-body"
      className="etak-artifact-body max-w-none text-sm leading-relaxed"
      style={{ color: 'var(--text-primary)' }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  );
}
