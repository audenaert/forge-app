// Markdown parsing for the filesystem adapter.
//
// Uses `remark` + `remark-frontmatter` + `yaml` to split a file into
// frontmatter plus a body AST, then extracts H2-bounded sections by slicing
// the original source text between heading positions (for round-trip
// faithfulness). Hand-rolled `^## ` scanning is explicitly rejected — see
// design spec §3.7 — because it breaks on code fences containing `##`,
// HTML blocks, setext headings, and nested structures. remark handles all
// of those by being a real markdown parser.
//
// Section slicing strategy:
//   1. remark-parse walks the file; remark-frontmatter peels the YAML
//      block into its own `yaml` node.
//   2. We find the character offset of the first `---` that closes the
//      frontmatter block to get `bodyStart`.
//   3. We collect every top-level H2 heading with its AST `position.start.offset`
//      (offsets are into the full source because remark's positions are
//      relative to the whole file).
//   4. Each section's raw content is source.slice(afterThisHeadingLine, nextHeadingOffsetOrEOF).
//      We strip the heading line itself since the template carries the canonical
//      heading text and the serializer re-emits it.

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import { parse as yamlParse } from 'yaml';
import type { Root, RootContent, Heading, Yaml, Text, InlineCode } from 'mdast';

import type {
  ArtifactRef,
  BodyTemplate,
  DriftWarning,
  SectionedBodyTemplate,
} from '../../schemas/index.js';
import { BODY_TEMPLATES } from '../../schemas/index.js';
import type {
  ArtifactFrontmatter,
  ParsedBodyDocument,
  ParsedBodySection,
} from '../operations.js';
import { ValidationError } from '../errors.js';

export interface ParseResult {
  frontmatter: ArtifactFrontmatter;
  body: ParsedBodyDocument;
}

const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ['yaml']);

export function parseMarkdown(source: string, ref: ArtifactRef): ParseResult {
  let tree: Root;
  try {
    tree = processor.parse(source) as Root;
  } catch (err) {
    // Malformed markdown is user-correctable (edit the file) — exit 1.
    const message = err instanceof Error ? err.message : String(err);
    throw new ValidationError(
      `failed to parse markdown for ${ref.type}/${ref.slug}: ${message}`,
      { location: { artifactRef: ref } },
    );
  }

  const frontmatter = extractFrontmatter(tree, ref);
  const template = BODY_TEMPLATES[ref.type];
  const body = buildBodyDocument(tree, source, ref, template);

  return { frontmatter, body };
}

/**
 * Locate the character offset just past the end of the YAML frontmatter
 * block, using the remark-frontmatter AST node's end position. Returns 0
 * if no frontmatter is present. This trusts remark's positions (as the
 * rest of the parser does for H2 headings) instead of hand-scanning for
 * the closing \`---\` — the hand-scan was fragile on CRLF sources and
 * duplicated logic already expressed in the AST.
 */
function findBodyStartFromTree(tree: Root): number {
  const first = tree.children[0];
  if (!first || first.type !== 'yaml') return 0;
  const end = first.position?.end?.offset;
  return typeof end === 'number' ? end : 0;
}

function extractFrontmatter(tree: Root, ref: ArtifactRef): ArtifactFrontmatter {
  // User-correctable frontmatter problems (missing/invalid YAML block,
  // missing required fields, type mismatch) raise ValidationError (exit 1)
  // per design.md §4.3. AdapterError (exit 3) is reserved for system-level
  // IO failures — anything here is fixable by editing the file.
  const first = tree.children[0];
  if (!first || first.type !== 'yaml') {
    throw new ValidationError(
      `missing YAML frontmatter in ${ref.type}/${ref.slug}`,
      { location: { artifactRef: ref } },
    );
  }
  const yamlNode = first as Yaml;
  let parsed: unknown;
  try {
    parsed = yamlParse(yamlNode.value);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new ValidationError(
      `invalid YAML frontmatter in ${ref.type}/${ref.slug}: ${message}`,
      { location: { artifactRef: ref } },
    );
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new ValidationError(
      `frontmatter for ${ref.type}/${ref.slug} must be a YAML mapping`,
      { location: { artifactRef: ref } },
    );
  }
  const obj = parsed as Record<string, unknown>;
  if (typeof obj['name'] !== 'string') {
    throw new ValidationError(
      `frontmatter for ${ref.type}/${ref.slug} is missing required \`name\``,
      { location: { artifactRef: ref } },
    );
  }
  if (typeof obj['type'] !== 'string') {
    throw new ValidationError(
      `frontmatter for ${ref.type}/${ref.slug} is missing required \`type\``,
      { location: { artifactRef: ref } },
    );
  }
  if (obj['type'] !== ref.type) {
    throw new ValidationError(
      `frontmatter \`type: ${String(obj['type'])}\` does not match ref type \`${ref.type}\``,
      { location: { artifactRef: ref } },
    );
  }
  return obj as ArtifactFrontmatter;
}

interface H2Position {
  text: string;
  /** Offset of the `#` character in the full source. */
  startOffset: number;
  /** Offset just past the newline that terminates the heading line. */
  contentStartOffset: number;
}

function buildBodyDocument(
  tree: Root,
  source: string,
  ref: ArtifactRef,
  template: BodyTemplate,
): ParsedBodyDocument {
  const warnings: DriftWarning[] = [];
  const bodyStart = findBodyStartFromTree(tree);

  // Opaque bodies (critique) — one section, no drift detection. The
  // section is flagged `status: 'extra'` rather than invented as a special
  // 'opaque' kind so downstream consumers can treat it uniformly with
  // other headless bodies. The serializer shortcuts on `template.kind`.
  if (template.kind === 'opaque') {
    const content = source.slice(bodyStart).replace(/^\n+/, '').replace(/\s+$/, '');
    return {
      sections: content.length === 0
        ? []
        : [
            {
              heading: '',
              slug: 'body',
              status: 'extra',
              content,
            },
          ],
      warnings: [],
    };
  }

  const sectioned: SectionedBodyTemplate = template;
  const h2s = collectH2Positions(tree, source);

  // No H2 headings at all — the body is either empty or a single anonymous
  // preamble block. Emit a missing-required warning for every required
  // template section and surface the content as a `preamble` section so
  // round-trip preserves it.
  if (h2s.length === 0) {
    for (const tmpl of sectioned.sections) {
      if (tmpl.required) {
        warnings.push({
          kind: 'missing_required_section',
          severity: 'warning',
          message: `missing required section "${tmpl.name}"`,
          location: { artifactRef: ref, section: tmpl.name },
          details: { sectionSlug: tmpl.slug },
        });
      }
    }
    const content = source.slice(bodyStart).replace(/^\n+/, '').replace(/\s+$/, '');
    return {
      sections: content.length === 0
        ? []
        : [
            {
              heading: '',
              slug: 'preamble',
              status: 'preamble',
              content,
            },
          ],
      warnings,
    };
  }

  // Any content between bodyStart and the first H2 is a preamble — preserve
  // it as an anonymous leading section so round-trip doesn't lose it.
  const sections: ParsedBodySection[] = [];
  const preludeRaw = source.slice(bodyStart, h2s[0]!.startOffset);
  const preludeTrimmed = preludeRaw.replace(/^\n+/, '').replace(/\s+$/, '');
  if (preludeTrimmed.length > 0) {
    sections.push({
      heading: '',
      slug: 'preamble',
      status: 'preamble',
      content: preludeTrimmed,
    });
  }

  for (let i = 0; i < h2s.length; i += 1) {
    const h = h2s[i]!;
    const next = h2s[i + 1];
    const endOffset = next ? next.startOffset : source.length;
    const raw = source.slice(h.contentStartOffset, endOffset);
    const content = raw.replace(/\s+$/, '');

    const matched = matchTemplateSection(h.text, sectioned);
    if (matched) {
      sections.push({
        heading: h.text,
        slug: matched.slug,
        status: 'canonical',
        canonicalOrder: matched.order,
        content,
      });
    } else {
      sections.push({
        heading: h.text,
        slug: slugifyHeading(h.text),
        status: 'extra',
        content,
      });
    }
  }

  // Drift analysis: reordering, missing required, extras, and rename
  // candidates. Every analysis is additive — we never remove a section
  // from `sections` in response to a warning.
  const canonicalSeen = new Set<string>();
  let lastOrder = 0;
  let reorderWarned = false;
  for (const s of sections) {
    if (s.status === 'canonical' && typeof s.canonicalOrder === 'number') {
      canonicalSeen.add(s.slug);
      if (s.canonicalOrder < lastOrder && !reorderWarned) {
        warnings.push({
          kind: 'section_reordered',
          severity: 'info',
          message: 'canonical sections appear in a non-canonical order',
          location: { artifactRef: ref },
        });
        reorderWarned = true;
      }
      lastOrder = Math.max(lastOrder, s.canonicalOrder);
    }
  }

  for (const tmpl of sectioned.sections) {
    if (tmpl.required && !canonicalSeen.has(tmpl.slug)) {
      warnings.push({
        kind: 'missing_required_section',
        severity: 'warning',
        message: `missing required section "${tmpl.name}"`,
        location: { artifactRef: ref, section: tmpl.name },
        details: { sectionSlug: tmpl.slug },
      });
    }
  }

  for (const s of sections) {
    if (s.status === 'extra') {
      warnings.push({
        kind: 'extra_section',
        severity: 'info',
        message: `extra (non-template) section "${s.heading}"`,
        location: { artifactRef: ref, section: s.heading },
      });
    }
  }

  // Rename candidates (best-effort, conservative). If a required canonical
  // section is missing AND there is an extra section with a similar
  // heading, promote that section's status to `renamed` so serialization
  // preserves the author's wording and downstream consumers can still find
  // it by canonical slug.
  for (const tmpl of sectioned.sections) {
    if (canonicalSeen.has(tmpl.slug)) continue;
    const candidate = sections.find(
      (s) => s.status === 'extra' && looksLikeRename(s.heading, tmpl.name),
    );
    if (candidate) {
      candidate.status = 'renamed';
      candidate.slug = tmpl.slug;
      candidate.canonicalOrder = tmpl.order;
      warnings.push({
        kind: 'section_renamed',
        severity: 'warning',
        message: `section "${candidate.heading}" may be a renamed "${tmpl.name}"`,
        location: { artifactRef: ref, section: candidate.heading },
        details: { canonicalSlug: tmpl.slug, canonicalName: tmpl.name },
      });
    }
  }

  return { sections, warnings };
}

function collectH2Positions(tree: Root, source: string): H2Position[] {
  const out: H2Position[] = [];
  for (const child of tree.children as RootContent[]) {
    if (child.type !== 'heading' || (child as Heading).depth !== 2) continue;
    const h = child as Heading;
    const startOffset = h.position?.start?.offset;
    if (typeof startOffset !== 'number') continue;
    const text = stringifyHeadingChildren(h);
    // Content starts on the line after the heading.
    const nl = source.indexOf('\n', startOffset);
    const contentStartOffset = nl === -1 ? source.length : nl + 1;
    out.push({ text, startOffset, contentStartOffset });
  }
  return out;
}

function stringifyHeadingChildren(heading: Heading): string {
  let out = '';
  for (const c of heading.children) {
    if (c.type === 'text') {
      out += (c as Text).value;
    } else if (c.type === 'inlineCode') {
      out += `\`${(c as InlineCode).value}\``;
    } else if ('value' in c && typeof (c as { value: unknown }).value === 'string') {
      out += (c as { value: string }).value;
    }
  }
  return out.trim();
}

function matchTemplateSection(heading: string, template: SectionedBodyTemplate) {
  const normalized = heading.trim().toLowerCase();
  for (const s of template.sections) {
    if (s.name.trim().toLowerCase() === normalized) {
      return s;
    }
  }
  return null;
}

export function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Rename-candidate heuristic. Conservative: returns true when the extra
 * heading shares at least half of the canonical heading's tokens (minimum
 * one token). False positives are worse than silence — we'd rather miss a
 * rename than turn a legitimate extra section into a spurious warning.
 */
function looksLikeRename(authored: string, canonical: string): boolean {
  const tokens = (s: string): string[] =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 0);
  const a = new Set(tokens(authored));
  const c = tokens(canonical);
  if (c.length === 0) return false;
  let hits = 0;
  for (const w of c) if (a.has(w)) hits += 1;
  return hits >= Math.max(1, Math.ceil(c.length / 2));
}
