// Fixture-backed integration: copy real artifacts from docs/discovery
// into a temp artifact root and verify the fs adapter reads them cleanly.
// This is the "our own product's artifacts parse under our own adapter"
// smoke test called for in the story.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FsAdapter } from '../../src/index.js';
import { pluralOf } from '../../src/adapters/fs/paths.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..', '..', '..');

interface Fixture {
  type: 'idea' | 'opportunity' | 'objective';
  slug: string;
  source: string;
  // Template sections we expect to find on read, keyed by canonical slug.
  expectCanonicalSlugs: string[];
}

const FIXTURES: Fixture[] = [
  {
    type: 'idea',
    slug: 'etak-cli-as-growth-onramp',
    source: join(
      REPO_ROOT,
      'docs/discovery/ideas/etak-cli-as-growth-onramp.md',
    ),
    expectCanonicalSlugs: [
      'description',
      'strategic_rationale',
      'why_this_could_work',
      'open_questions',
    ],
  },
  {
    type: 'idea',
    slug: 'graph-backed-artifact-store',
    source: join(
      REPO_ROOT,
      'docs/discovery/ideas/graph-backed-artifact-store.md',
    ),
    // This one omits "Strategic Rationale" — it's optional, so the parser
    // should not emit a missing-required warning.
    expectCanonicalSlugs: ['description', 'why_this_could_work', 'open_questions'],
  },
  {
    type: 'opportunity',
    slug: 'solo-devs-blocked-by-team-tool-overhead',
    source: join(
      REPO_ROOT,
      'docs/discovery/opportunities/solo-devs-blocked-by-team-tool-overhead.md',
    ),
    expectCanonicalSlugs: ['description', 'evidence', 'who_experiences_this'],
  },
  {
    type: 'objective',
    slug: 'grow-etak-via-local-first-plg',
    source: join(
      REPO_ROOT,
      'docs/discovery/objectives/grow-etak-via-local-first-plg.md',
    ),
    expectCanonicalSlugs: ['description', 'context', 'success_criteria', 'out_of_scope'],
  },
];

describe('FsAdapter against real discovery fixtures', () => {
  let root: string;
  let adapter: FsAdapter;

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'etak-fixtures-'));
    // Lay out each fixture under the artifact-root convention.
    for (const f of FIXTURES) {
      const dir = join(root, pluralOf(f.type));
      await mkdir(dir, { recursive: true });
      const content = await readFile(f.source, 'utf8');
      await writeFile(join(dir, `${f.slug}.md`), content, 'utf8');
    }
    adapter = new FsAdapter({ root });
  });

  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  for (const f of FIXTURES) {
    it(`parses ${f.type}/${f.slug} with the expected canonical sections`, async () => {
      const doc = await adapter.read({ type: f.type, slug: f.slug });
      const canonicalSlugs = doc.body.sections
        .filter((s) => s.status === 'canonical')
        .map((s) => s.slug);
      for (const expected of f.expectCanonicalSlugs) {
        expect(canonicalSlugs).toContain(expected);
      }
      // No missing-required warnings for real fixtures — they satisfy
      // their own type's template.
      const missing = doc.warnings.filter(
        (w) => w.kind === 'missing_required_section',
      );
      expect(missing).toEqual([]);
    });
  }
});
