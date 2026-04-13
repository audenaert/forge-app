// Shared adapter contract test suite.
//
// Consumed by `fs-adapter.test.ts` (real behavior) and
// `graphql-adapter.test.ts` (NotWiredError behavior). The suite assumes
// the factory returns a fresh adapter plus a cleanup function for each
// invocation, so tests are isolated.

import { describe, it, expect, afterEach } from 'vitest';

import type {
  ArtifactRef,
  BodyDocument,
  Document,
  DriftWarning,
  StorageAdapter,
} from '../../src/index.js';
import { NotWiredError, ValidationError } from '../../src/index.js';

export interface AdapterFactory {
  (): Promise<{ adapter: StorageAdapter; cleanup: () => Promise<void> }>;
}

export interface ContractOptions {
  /** Human-readable label for the describe block. */
  name: string;
  factory: AdapterFactory;
  /**
   * When true, every method is expected to throw NotWiredError rather than
   * implement real behavior. Used by the graphql stub's contract run.
   */
  expectNotWired?: boolean;
}

export function runAdapterContractTests(opts: ContractOptions): void {
  describe(`${opts.name} (StorageAdapter contract)`, () => {
    if (opts.expectNotWired) {
      runNotWiredContract(opts.factory);
    } else {
      runRealContract(opts.factory);
    }
  });
}

// -- Real-behavior contract (fs and any future real adapter) ------------------

function runRealContract(factory: AdapterFactory): void {
  const cleanups: Array<() => Promise<void>> = [];

  async function mk(): Promise<StorageAdapter> {
    const { adapter, cleanup } = await factory();
    cleanups.push(cleanup);
    return adapter;
  }

  afterEach(async () => {
    while (cleanups.length > 0) {
      const c = cleanups.shift()!;
      try {
        await c();
      } catch {
        /* best-effort cleanup */
      }
    }
  });

  it('write then read round-trips frontmatter and body faithfully', async () => {
    const adapter = await mk();
    const doc = makeIdea('round-trip-demo', {
      sections: [
        section('Description', 'One-line description.'),
        section('Why This Could Work', 'Because it is simple.'),
      ],
    });
    await adapter.write(doc);
    const read = await adapter.read(doc.ref);

    expect(read.frontmatter.name).toBe(doc.frontmatter.name);
    expect(read.frontmatter.type).toBe('idea');
    expect(read.frontmatter['status']).toBe('draft');

    const slugs = read.body.sections.map((s) => s.slug);
    expect(slugs).toEqual(['description', 'why_this_could_work']);
    expect(read.body.sections[0]!.content.trim()).toBe('One-line description.');
    expect(read.body.sections[1]!.content.trim()).toBe('Because it is simple.');
    expect(missingRequired(read.warnings)).toHaveLength(0);
  });

  it('list returns written refs and filters by status', async () => {
    const adapter = await mk();
    await adapter.write(makeIdea('alpha', { status: 'draft' }));
    await adapter.write(makeIdea('beta', { status: 'validated' }));
    await adapter.write(makeIdea('gamma', { status: 'draft' }));

    const all = await adapter.list('idea');
    expect(all.map((r) => r.slug).sort()).toEqual(['alpha', 'beta', 'gamma']);

    const drafts = await adapter.list('idea', { status: 'draft' });
    expect(drafts.map((r) => r.slug).sort()).toEqual(['alpha', 'gamma']);
  });

  it('update changes a frontmatter field and leaves the rest intact', async () => {
    const adapter = await mk();
    const doc = makeIdea('upd-fm');
    await adapter.write(doc);
    await adapter.update(doc.ref, { frontmatter: { status: 'validated' } });

    const read = await adapter.read(doc.ref);
    expect(read.frontmatter['status']).toBe('validated');
    expect(read.frontmatter.name).toBe(doc.frontmatter.name);
    expect(read.body.sections.length).toBe(doc.body.sections.length);
  });

  it('section-replace rewrites one section, preserves the others and their order', async () => {
    const adapter = await mk();
    const doc = makeIdea('upd-section', {
      sections: [
        section('Description', 'Old description.'),
        section('Why This Could Work', 'Old rationale.'),
        section('Open Questions', 'Old questions.'),
      ],
    });
    await adapter.write(doc);

    await adapter.update(doc.ref, {
      body: {
        kind: 'section-replace',
        sectionSlug: 'why_this_could_work',
        content: 'New rationale here.',
      },
    });

    const read = await adapter.read(doc.ref);
    expect(read.body.sections.map((s) => s.slug)).toEqual([
      'description',
      'why_this_could_work',
      'open_questions',
    ]);
    expect(read.body.sections[1]!.content.trim()).toBe('New rationale here.');
    expect(read.body.sections[0]!.content.trim()).toBe('Old description.');
    expect(read.body.sections[2]!.content.trim()).toBe('Old questions.');
  });

  it('body-replace rewrites the whole body and preserves frontmatter', async () => {
    const adapter = await mk();
    const doc = makeIdea('upd-body');
    await adapter.write(doc);

    await adapter.update(doc.ref, {
      body: {
        kind: 'body-replace',
        content:
          '## Description\n\nFresh description.\n\n## Why This Could Work\n\nFresh rationale.\n',
      },
    });

    const read = await adapter.read(doc.ref);
    expect(read.frontmatter.name).toBe(doc.frontmatter.name);
    expect(read.body.sections.map((s) => s.slug)).toEqual([
      'description',
      'why_this_could_work',
    ]);
    expect(read.body.sections[0]!.content.trim()).toBe('Fresh description.');
  });

  it('link appends to the target field and shows on subsequent read', async () => {
    const adapter = await mk();
    const idea = makeIdea('linker');
    const opp = makeOpportunity('linkee');
    await adapter.write(idea);
    await adapter.write(opp);

    const result = await adapter.link(idea.ref, 'addresses', opp.ref);
    expect(result.warnings.some((w) => w.kind === 'dangling_ref')).toBe(false);

    const read = await adapter.read(idea.ref);
    expect(Array.isArray(read.frontmatter['addresses'])).toBe(true);
    expect((read.frontmatter['addresses'] as string[]).includes('linkee')).toBe(true);
  });

  it('link to a non-existent target emits dangling_ref but does not throw', async () => {
    const adapter = await mk();
    const idea = makeIdea('dangling-source');
    await adapter.write(idea);

    const result = await adapter.link(idea.ref, 'addresses', {
      type: 'opportunity',
      slug: 'does-not-exist',
    });
    expect(result.warnings.some((w) => w.kind === 'dangling_ref')).toBe(true);

    const read = await adapter.read(idea.ref);
    expect((read.frontmatter['addresses'] as string[]).includes('does-not-exist')).toBe(true);
  });

  it('slug collision on write errors by default with no silent overwrite', async () => {
    const adapter = await mk();
    const doc = makeIdea('dup');
    await adapter.write(doc);

    const second = makeIdea('dup', { name: 'Second attempt' });
    await expect(adapter.write(second)).rejects.toBeInstanceOf(ValidationError);

    const read = await adapter.read(doc.ref);
    // The original name survives; no silent overwrite.
    expect(read.frontmatter.name).toBe(doc.frontmatter.name);
  });

  it('round-trips an extra (non-template) section, flags it as extra', async () => {
    const adapter = await mk();
    const doc = makeIdea('with-extra', {
      sections: [
        section('Description', 'Desc.'),
        section('Why This Could Work', 'Rationale.'),
        section('Notes to Self', 'Just a thought.'),
      ],
    });
    await adapter.write(doc);

    const read = await adapter.read(doc.ref);
    const notes = read.body.sections.find((s) => s.heading === 'Notes to Self');
    expect(notes).toBeDefined();
    expect(notes?.status).toBe('extra');
    expect(notes?.content.trim()).toBe('Just a thought.');
    expect(read.warnings.some((w) => w.kind === 'extra_section')).toBe(true);
  });

  it('flags a missing required section as a warning but still reads successfully', async () => {
    const adapter = await mk();
    const doc = makeIdea('missing-required', {
      sections: [
        // Intentionally drop "Description", which is required.
        section('Why This Could Work', 'Rationale only.'),
      ],
    });
    await adapter.write(doc);

    const read = await adapter.read(doc.ref);
    const missing = read.warnings.filter((w) => w.kind === 'missing_required_section');
    expect(missing.length).toBeGreaterThanOrEqual(1);
    expect(missing[0]!.details?.['sectionSlug']).toBe('description');
  });

  it('preserves section content byte-for-byte through a round-trip', async () => {
    // Round-trip test that exercises every remark trap the hand-rolled
    // parser would fall into: fenced code with `##`, nested lists, and
    // a heading with inline code. Content is compared per-section (not
    // whole-document) because the serializer's canonical "one blank line
    // between sections" normalization is allowed to adjust inter-section
    // whitespace — anything *inside* a section body must be preserved
    // exactly.
    const adapter = await mk();

    const descriptionBody = [
      'A block of prose first.',
      '',
      '```markdown',
      '## Not a real heading',
      'fenced code should survive untouched',
      '```',
      '',
      'And a trailing paragraph.',
    ].join('\n');

    const whyBody = [
      '- top level item',
      '  - nested item with `inline code`',
      '  - nested item with **emphasis**',
      '- another top level',
      '  1. numbered child',
      '  2. another numbered child',
    ].join('\n');

    const doc = makeIdea('byte-exact', {
      sections: [
        section('Description', descriptionBody),
        // Heading intentionally carries inline code, matching the canonical
        // name `Why This Could Work`. The serializer must round-trip the
        // section content even though the stored heading differs.
        section('Why This Could Work', 'With `etak init` we bootstrap the project.'),
        section('Open Questions', 'What about `--force-suffix`? And what if someone writes `##` inline?'),
      ],
    });
    await adapter.write(doc);
    const read = await adapter.read(doc.ref);

    // Per-section strict equality. Parser captures raw content from the
    // first line after the `## heading` line up to (but not including) the
    // next H2, then strips trailing whitespace. The blank line the
    // serializer writes between heading and content appears at the start
    // of the captured region, so we normalize a single leading newline
    // before comparing. Nothing else is touched.
    const strip = (s: string): string => s.replace(/^\n/, '').replace(/\s+$/, '');
    const expected: Record<string, string> = {
      description: descriptionBody.replace(/\s+$/, ''),
      why_this_could_work: 'With `etak init` we bootstrap the project.',
      open_questions:
        'What about `--force-suffix`? And what if someone writes `##` inline?',
    };
    for (const s of read.body.sections) {
      expect(
        expected[s.slug],
        `section ${s.slug} present in expected map`,
      ).toBeDefined();
      expect(strip(s.content), `section ${s.slug} content`).toBe(expected[s.slug]);
    }
    // And the fenced code block in Description must not have been parsed
    // as a heading — so we should NOT see a "Not a real heading" section.
    expect(
      read.body.sections.find((s) => s.heading === 'Not a real heading'),
    ).toBeUndefined();
  });

  it('unlink removes a link on a subsequent read', async () => {
    const adapter = await mk();
    const idea = makeIdea('unlinker');
    const opp = makeOpportunity('unlinkee');
    await adapter.write(idea);
    await adapter.write(opp);

    await adapter.link(idea.ref, 'addresses', opp.ref);
    const linked = await adapter.read(idea.ref);
    expect((linked.frontmatter['addresses'] as string[]).includes('unlinkee')).toBe(true);

    await adapter.unlink(idea.ref, 'addresses', opp.ref);
    const unlinked = await adapter.read(idea.ref);
    const addresses = unlinked.frontmatter['addresses'];
    expect(Array.isArray(addresses) && (addresses as string[]).includes('unlinkee')).toBe(
      false,
    );
  });

  it('unlink of a link that was never present is a no-op with link_not_present warning', async () => {
    // Symmetry with the dangling_ref behavior of link: neither operation
    // throws for a missing target/link, both surface a warning instead.
    const adapter = await mk();
    const idea = makeIdea('unlinker-noop');
    await adapter.write(idea);

    const result = await adapter.unlink(idea.ref, 'addresses', {
      type: 'opportunity',
      slug: 'never-existed',
    });
    expect(result.warnings.some((w) => w.kind === 'link_not_present')).toBe(true);

    const read = await adapter.read(idea.ref);
    // The frontmatter may now contain an empty `addresses: []` or still be
    // absent — either is acceptable; what matters is that the slug is not
    // present.
    const addresses = read.frontmatter['addresses'];
    if (Array.isArray(addresses)) {
      expect((addresses as string[]).includes('never-existed')).toBe(false);
    }
  });

  it('critique is body-as-opaque: no drift warnings for any body content', async () => {
    const adapter = await mk();
    const critique: Document = {
      ref: { type: 'critique', slug: 'opaque-body' },
      frontmatter: {
        name: 'A free-form critique',
        type: 'critique',
      },
      body: {
        sections: [
          {
            heading: '',
            slug: '__opaque__',
            status: 'extra',
            content:
              'This is a narrative critique with no fixed structure.\n\n' +
              'It has paragraphs, **emphasis**, and `inline code`.',
          },
        ],
        warnings: [],
      },
      warnings: [],
    };
    await adapter.write(critique);

    const read = await adapter.read(critique.ref);
    expect(read.warnings).toHaveLength(0);
    expect(read.body.sections).toHaveLength(1);
    expect(read.body.sections[0]!.content).toContain('narrative critique');
    expect(read.body.sections[0]!.content).toContain('**emphasis**');
  });
}

// -- NotWired contract (graphql stub) -----------------------------------------

function runNotWiredContract(factory: AdapterFactory): void {
  it('every StorageAdapter method throws NotWiredError', async () => {
    const { adapter } = await factory();
    const ref: ArtifactRef = { type: 'idea', slug: 'anything' };
    const doc: Document = makeIdea('anything');

    const calls: Array<[string, () => Promise<unknown>]> = [
      ['read', () => adapter.read(ref)],
      ['write', () => adapter.write(doc)],
      ['list', () => adapter.list('idea')],
      ['update', () => adapter.update(ref, { frontmatter: { status: 'draft' } })],
      ['link', () => adapter.link(ref, 'addresses', { type: 'opportunity', slug: 'x' })],
      ['unlink', () => adapter.unlink(ref, 'addresses', { type: 'opportunity', slug: 'x' })],
    ];

    for (const [method, call] of calls) {
      await expect(call(), `${method} should throw NotWiredError`).rejects.toBeInstanceOf(
        NotWiredError,
      );
      try {
        await call();
      } catch (err) {
        expect(err).toBeInstanceOf(NotWiredError);
        const e = err as NotWiredError;
        expect(e.code).toBe('E_NOT_WIRED');
        expect(e.exitCode).toBe(3);
        expect(e.operation).toBe(method);
      }
    }
  });
}

// -- fixtures ----------------------------------------------------------------

interface IdeaOpts {
  status?: string;
  name?: string;
  sections?: ReturnType<typeof section>[];
}

function makeIdea(slug: string, opts: IdeaOpts = {}): Document {
  const sections = opts.sections ?? [
    section('Description', 'A one-line description.'),
    section('Why This Could Work', 'Because it does.'),
  ];
  return {
    ref: { type: 'idea', slug },
    frontmatter: {
      name: opts.name ?? `Idea ${slug}`,
      type: 'idea',
      status: opts.status ?? 'draft',
    },
    body: buildBody(sections),
    warnings: [],
  };
}

function makeOpportunity(slug: string): Document {
  return {
    ref: { type: 'opportunity', slug },
    frontmatter: {
      name: `Opportunity ${slug}`,
      type: 'opportunity',
      status: 'active',
    },
    body: buildBody([
      section('Description', 'Opportunity description.'),
      section('Evidence', 'Evidence text.'),
    ]),
    warnings: [],
  };
}

function section(heading: string, content: string) {
  return { heading, content };
}

function buildBody(
  entries: Array<{ heading: string; content: string }>,
): BodyDocument {
  return {
    sections: entries.map((e) => ({
      heading: e.heading,
      slug: slugify(e.heading),
      status: 'canonical' as const,
      content: e.content,
    })),
    warnings: [],
  };
}

function slugify(heading: string): string {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function missingRequired(warnings: DriftWarning[]): DriftWarning[] {
  return warnings.filter((w) => w.kind === 'missing_required_section');
}
