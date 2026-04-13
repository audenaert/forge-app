// Frontmatter + body serialization for the filesystem adapter.
//
// Strategy:
//   - Frontmatter is emitted as YAML between `---` delimiters. Key order
//     is canonical (stable across round-trips) so git diffs stay readable.
//     Known keys emit first in a fixed order; unknown keys emit after in
//     the order they appear in the input object.
//   - Body is emitted as the ordered list of sections from the parsed
//     BodyDocument, each preceded by its `## <heading>` line. Canonical
//     sections use the template heading; renamed and extra sections use
//     the authored heading (so the human's wording is preserved). Section
//     `content` is already raw markdown and is emitted verbatim, separated
//     by exactly one blank line.
//   - The `preamble` pseudo-section (heading `""`, status `preamble`) is
//     emitted before the first real section, heading-less, so content
//     authored before the first H2 is preserved on round-trip.
//
// We deliberately do not use `remark-stringify` to re-emit the body. The
// spec (§3.7) calls out remark-stringify as a legitimate option, but it
// normalizes whitespace, bullet style, and fences. Since our parser
// captures raw content for each section verbatim, emitting that raw
// content unchanged preserves byte-level fidelity within sections — which
// is what authors will actually notice in diffs.

import { stringify as yamlStringify } from 'yaml';
import type { BodyTemplate } from '../../schemas/index.js';
import { BODY_TEMPLATES } from '../../schemas/index.js';
import type {
  ArtifactFrontmatter,
  ParsedBodyDocument,
  ParsedBodySection,
} from '../operations.js';

/** Canonical frontmatter key order. Keys not in this list follow in insertion order. */
const FRONTMATTER_KEY_ORDER: readonly string[] = [
  'name',
  'type',
  'status',
  'hmw',
  // Link fields in deterministic order.
  'supports',
  'addresses',
  'assumed_by',
  'tests',
  'result_informs',
  'delivered_by',
  'target',
];

export function serializeDocument(
  frontmatter: ArtifactFrontmatter,
  body: ParsedBodyDocument,
): string {
  const fm = serializeFrontmatter(frontmatter);
  const template = BODY_TEMPLATES[frontmatter.type];
  const bodyText = serializeBody(body, template);
  return `${fm}\n${bodyText}`;
}

export function serializeFrontmatter(frontmatter: ArtifactFrontmatter): string {
  const ordered: Record<string, unknown> = {};
  for (const key of FRONTMATTER_KEY_ORDER) {
    if (key in frontmatter) {
      ordered[key] = frontmatter[key];
    }
  }
  for (const [key, value] of Object.entries(frontmatter)) {
    if (!(key in ordered)) {
      ordered[key] = value;
    }
  }
  // yaml v2 stringify defaults are close to what we want. Force
  // `lineWidth: 0` so long strings aren't folded (folding is hostile on
  // names and messages).
  const yaml = yamlStringify(ordered, { lineWidth: 0 }).replace(/\n$/, '');
  return `---\n${yaml}\n---\n`;
}

function serializeBody(body: ParsedBodyDocument, template: BodyTemplate): string {
  // Opaque body (critique): exactly one section whose content is the
  // entire body, emitted headless.
  if (template.kind === 'opaque') {
    if (body.sections.length === 0) return '\n';
    const content = body.sections[0]!.content.replace(/\s+$/, '');
    return `\n${content}\n`;
  }

  const parts: string[] = [];
  for (const s of body.sections) {
    if (s.status === 'preamble') {
      // Preserve preamble content with no heading.
      parts.push(s.content.replace(/\s+$/, ''));
      continue;
    }
    const heading = renderHeading(s, template);
    const content = s.content.replace(/\s+$/, '');
    parts.push(content.length > 0 ? `## ${heading}\n\n${content}` : `## ${heading}\n`);
  }
  if (parts.length === 0) return '\n';
  return `\n${parts.join('\n\n')}\n`;
}

function renderHeading(section: ParsedBodySection, template: BodyTemplate): string {
  // Canonical sections use the canonical template name. Renamed sections
  // and extras preserve the authored heading. Opaque templates never call
  // this path, so we can safely assume `kind === 'sectioned'` here.
  if (template.kind === 'sectioned' && section.status === 'canonical') {
    const tmpl = template.sections.find((t) => t.slug === section.slug);
    return tmpl ? tmpl.name : section.heading;
  }
  return section.heading;
}
