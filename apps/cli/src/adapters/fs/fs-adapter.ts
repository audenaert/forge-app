// Filesystem storage adapter — the real implementation of StorageAdapter
// against `.etak/artifacts/<type>s/<slug>.md`.
//
// Responsibilities:
//   - Resolve refs to absolute paths under the configured artifact root.
//   - Read and parse files into typed Documents.
//   - Apply updates (frontmatter merges and section- or body-level
//     replacements), re-serialize, and write atomically.
//   - Enforce slug collision policy on `write` (error by default).
//   - Implement link/unlink as read-modify-write on a typed frontmatter
//     field, emitting a `dangling_ref` warning when the target does not
//     resolve (warn-and-proceed per §2).
//
// Atomic writes: we write to a temp file in the same directory and rename
// into place. On rename failure, the temp file is cleaned up; the
// original (if any) is untouched.

import { mkdir, readFile, rename, stat, unlink, writeFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

import type { StorageAdapter } from '../interface.js';
import type {
  ArtifactRef,
  ArtifactType,
  DriftWarning,
} from '../../schemas/index.js';
import type {
  ArtifactFrontmatter,
  BodyUpdate,
  Document,
  ListFilter,
  ParsedBodyDocument,
  ParsedBodySection,
  UpdateChanges,
  WriteResult,
} from '../operations.js';
import { AdapterError, NotFoundError, ValidationError } from '../errors.js';
import { directoryForType, fileForRef } from './paths.js';
import { parseMarkdown } from './parser.js';
import { serializeDocument } from './serializer.js';
import { SlugSchema } from '../../schemas/common.js';

/**
 * Validate every `ArtifactRef` crossing a public adapter boundary against
 * the schema package's `SlugSchema`. This is the first layer of defense
 * against path traversal: any slug containing `..`, `/`, or otherwise
 * non-kebab-case characters is rejected before it reaches the path layer.
 * The second layer — `assertUnderRoot` in `paths.ts` — catches anything
 * that slips past.
 */
function validateRef(ref: ArtifactRef): void {
  const result = SlugSchema.safeParse(ref.slug);
  if (!result.success) {
    throw new ValidationError(
      `invalid slug \`${String(ref.slug)}\`: ${result.error.issues[0]?.message ?? 'slug failed validation'}`,
      { location: { artifactRef: ref }, details: { slug: ref.slug, issues: result.error.issues } },
    );
  }
}

export interface FsAdapterOptions {
  /** Absolute path to the artifact root (e.g. `<project>/.etak/artifacts`). */
  root: string;
}

export class FsAdapter implements StorageAdapter {
  public readonly root: string;

  public constructor(opts: FsAdapterOptions) {
    this.root = resolve(opts.root);
  }

  public async read(ref: ArtifactRef): Promise<Document> {
    validateRef(ref);
    const file = fileForRef(this.root, ref);
    let source: string;
    try {
      source = await readFile(file, 'utf8');
    } catch (err) {
      if (isENoEnt(err)) {
        throw new NotFoundError(`artifact not found: ${ref.type}/${ref.slug}`, { ref });
      }
      throw new AdapterError(
        `failed to read ${ref.type}/${ref.slug}: ${errMessage(err)}`,
        { location: { artifactRef: ref } },
      );
    }
    const parsed = parseMarkdown(source, ref);
    return {
      ref,
      frontmatter: parsed.frontmatter,
      body: parsed.body,
      warnings: parsed.body.warnings.slice(),
    };
  }

  public async write(document: Document): Promise<WriteResult> {
    validateRef(document.ref);
    const file = fileForRef(this.root, document.ref);
    await this.ensureDirectory(document.ref.type);

    // Slug collision policy: error by default. The caller (higher layer)
    // can implement `--force-suffix` by picking a different slug before
    // calling write.
    if (await pathExists(file)) {
      throw new ValidationError(
        `slug already exists: ${document.ref.type}/${document.ref.slug}`,
        { location: { artifactRef: document.ref }, details: { path: file } },
      );
    }

    const text = serializeDocument(document.frontmatter, document.body);
    await atomicWrite(file, text);

    // Re-read so the returned document reflects the parsed-back state.
    const reread = await this.read(document.ref);
    return { document: reread, warnings: reread.warnings.slice() };
  }

  public async list(type: ArtifactType, filter?: ListFilter): Promise<ArtifactRef[]> {
    const dir = directoryForType(this.root, type);
    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch (err) {
      if (isENoEnt(err)) {
        return [];
      }
      throw new AdapterError(
        `failed to list ${type}: ${errMessage(err)}`,
      );
    }
    const refs: ArtifactRef[] = [];
    for (const entry of entries) {
      if (!entry.endsWith('.md')) continue;
      const slug = entry.slice(0, -'.md'.length);
      const ref: ArtifactRef = { type, slug };
      if (filter && (filter.status || filter.frontmatter)) {
        let doc: Document;
        try {
          doc = await this.read(ref);
        } catch {
          continue;
        }
        if (filter.status && doc.frontmatter.status !== filter.status) continue;
        if (filter.frontmatter) {
          let ok = true;
          for (const [k, v] of Object.entries(filter.frontmatter)) {
            if (doc.frontmatter[k] !== v) {
              ok = false;
              break;
            }
          }
          if (!ok) continue;
        }
      }
      refs.push(ref);
    }
    refs.sort((a, b) => a.slug.localeCompare(b.slug));
    return refs;
  }

  public async update(ref: ArtifactRef, changes: UpdateChanges): Promise<WriteResult> {
    validateRef(ref);
    const existing = await this.read(ref);
    const mergedFrontmatter: ArtifactFrontmatter = {
      ...existing.frontmatter,
      ...(changes.frontmatter ?? {}),
    };
    // Never allow type or name stripping via update.
    if (mergedFrontmatter.type !== ref.type) {
      mergedFrontmatter.type = ref.type;
    }

    let nextBody: ParsedBodyDocument = existing.body;
    const updateWarnings: DriftWarning[] = [];
    if (changes.body) {
      const applied = applyBodyUpdate(existing.body, changes.body, ref);
      nextBody = applied.body;
      updateWarnings.push(...applied.warnings);
    }

    const text = serializeDocument(mergedFrontmatter, nextBody);
    const file = fileForRef(this.root, ref);
    await atomicWrite(file, text);

    const reread = await this.read(ref);
    return {
      document: reread,
      warnings: mergeWarnings(reread.warnings, updateWarnings),
    };
  }

  public async link(from: ArtifactRef, field: string, to: ArtifactRef): Promise<WriteResult> {
    validateRef(from);
    validateRef(to);
    const existing = await this.read(from);
    const warnings: DriftWarning[] = existing.warnings.slice();

    // Dangling-ref check: warn and proceed per §2.
    if (!(await this.refExists(to))) {
      warnings.push({
        kind: 'dangling_ref',
        severity: 'warning',
        message: `link target ${to.type}/${to.slug} does not exist yet`,
        location: { artifactRef: from, field },
        details: { to, field },
      });
    }

    const next = addLinkField(existing.frontmatter, field, to.slug);
    const text = serializeDocument(next, existing.body);
    await atomicWrite(fileForRef(this.root, from), text);

    const reread = await this.read(from);
    return { document: reread, warnings: mergeWarnings(reread.warnings, warnings) };
  }

  public async unlink(from: ArtifactRef, field: string, to: ArtifactRef): Promise<WriteResult> {
    validateRef(from);
    validateRef(to);
    const existing = await this.read(from);
    const warnings: DriftWarning[] = existing.warnings.slice();

    const { next, removed } = removeLinkField(existing.frontmatter, field, to.slug);
    if (!removed) {
      warnings.push({
        kind: 'link_not_present',
        severity: 'info',
        message: `link ${field}=${to.type}/${to.slug} was not present on ${from.type}/${from.slug}`,
        details: { to, field },
      });
    }

    const text = serializeDocument(next, existing.body);
    await atomicWrite(fileForRef(this.root, from), text);

    const reread = await this.read(from);
    return { document: reread, warnings: mergeWarnings(reread.warnings, warnings) };
  }

  private async ensureDirectory(type: ArtifactType): Promise<void> {
    const dir = directoryForType(this.root, type);
    await mkdir(dir, { recursive: true });
  }

  private async refExists(ref: ArtifactRef): Promise<boolean> {
    return pathExists(fileForRef(this.root, ref));
  }
}

// --- helpers -----------------------------------------------------------------

interface AppliedBodyUpdate {
  body: ParsedBodyDocument;
  /**
   * Warnings that arose from applying the update itself, NOT the
   * warnings already on `body.warnings`. The caller merges these into
   * the `WriteResult.warnings` envelope so the chassis (M1-S5) can
   * render them alongside parse-time drift.
   */
  warnings: DriftWarning[];
}

function applyBodyUpdate(
  body: ParsedBodyDocument,
  update: BodyUpdate,
  ref: ArtifactRef,
): AppliedBodyUpdate {
  if (update.kind === 'body-replace') {
    // Re-parse the new raw body by constructing a pseudo-source with a
    // minimal frontmatter so the parser has something to match against
    // the type. This keeps the drift-detection path uniform.
    const pseudo = `---\nname: "_"\ntype: ${ref.type}\n---\n\n${update.content}`;
    const parsed = parseMarkdown(pseudo, ref);
    return { body: parsed.body, warnings: [] };
  }
  // section-replace: find a section by slug and rewrite its content. If
  // the section doesn't exist, append a new one as an extra at the end
  // and surface an `extra_section` drift warning so the caller can
  // render it — silently materializing a new section on a \"replace\"
  // action was the reviewer's concern.
  const target = update.sectionSlug;
  const nextSections: ParsedBodySection[] = body.sections.map((s) => {
    if (s.slug === target) {
      return { ...s, content: update.content };
    }
    return s;
  });
  const found = body.sections.some((s) => s.slug === target);
  const warnings: DriftWarning[] = [];
  if (!found) {
    const heading = friendlyHeading(target);
    nextSections.push({
      heading,
      slug: target,
      status: 'extra',
      content: update.content,
    });
    warnings.push({
      kind: 'extra_section',
      severity: 'info',
      message: `section-replace on unknown slug "${target}" appended a new extra section "${heading}"`,
      location: { artifactRef: ref, section: heading },
      details: { sectionSlug: target, reason: 'section_replace_fallback' },
    });
  }
  return {
    body: { sections: nextSections, warnings: body.warnings.slice() },
    warnings,
  };
}

function friendlyHeading(slug: string): string {
  return slug
    .split(/[_-]+/)
    .filter((w) => w.length > 0)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(' ');
}

function addLinkField(
  fm: ArtifactFrontmatter,
  field: string,
  slug: string,
): ArtifactFrontmatter {
  const next: ArtifactFrontmatter = { ...fm };
  const current = next[field];
  if (Array.isArray(current)) {
    if (!(current as unknown[]).includes(slug)) {
      next[field] = [...current, slug];
    }
    return next;
  }
  if (current === null || current === undefined) {
    // First write of an unknown field: infer scalar vs array based on
    // convention for known scalar link fields. Unknown fields default to
    // array; this is safer for link semantics (array-append).
    if (SCALAR_LINK_FIELDS.has(field)) {
      next[field] = slug;
    } else {
      next[field] = [slug];
    }
    return next;
  }
  // Scalar with a value: replace (matches §2 "scalar `link add` replaces").
  next[field] = slug;
  return next;
}

function removeLinkField(
  fm: ArtifactFrontmatter,
  field: string,
  slug: string,
): { next: ArtifactFrontmatter; removed: boolean } {
  const next: ArtifactFrontmatter = { ...fm };
  const current = next[field];
  if (Array.isArray(current)) {
    const filtered = (current as unknown[]).filter((v) => v !== slug);
    const removed = filtered.length !== current.length;
    next[field] = filtered;
    return { next, removed };
  }
  if (current === slug) {
    next[field] = null;
    return { next, removed: true };
  }
  return { next, removed: false };
}

const SCALAR_LINK_FIELDS = new Set(['target', 'delivered_by']);

function mergeWarnings(a: DriftWarning[], b: DriftWarning[]): DriftWarning[] {
  return [...a, ...b];
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (err) {
    if (isENoEnt(err)) return false;
    throw err;
  }
}

async function atomicWrite(targetPath: string, content: string): Promise<void> {
  await mkdir(dirname(targetPath), { recursive: true });
  const tmp = join(
    dirname(targetPath),
    `.${randomBytes(6).toString('hex')}.tmp`,
  );
  try {
    await writeFile(tmp, content, 'utf8');
    await rename(tmp, targetPath);
  } catch (err) {
    try {
      await unlink(tmp);
    } catch {
      /* best-effort cleanup */
    }
    throw new AdapterError(
      `failed to write ${targetPath}: ${errMessage(err)}`,
    );
  }
}

function isENoEnt(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 'ENOENT'
  );
}

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
