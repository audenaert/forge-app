// Test helpers shared across schema test files.
//
// Centralizes fixture path resolution and a stubbed `BodyDocument` so the
// per-type tests don't each re-invent the same boilerplate.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import matter from 'gray-matter';

import type { BodyDocument } from '../../../src/schemas/index.js';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Repo root — four levels up from `apps/cli/test/unit/schemas/`.
 * Resolved once at module load so tests stay fast.
 */
export const REPO_ROOT = resolve(here, '..', '..', '..', '..', '..');

export function fixturePath(relative: string): string {
  return resolve(REPO_ROOT, 'docs', 'discovery', relative);
}

/**
 * Parse frontmatter out of a real `.md` fixture using `gray-matter`. The
 * real-fixture round-trip test asserts that the returned object passes the
 * per-type Zod schema — this is the "schema drift from real usage" guardrail
 * from design.md §8.
 */
export function readFixtureFrontmatter(relative: string): Record<string, unknown> {
  const raw = readFileSync(fixturePath(relative), 'utf8');
  const parsed = matter(raw);
  return parsed.data as Record<string, unknown>;
}

/**
 * A minimal structurally-valid `BodyDocument`. The frontmatter schema is the
 * load-bearing contract this story validates; `body` is checked only for
 * shape (not content) until the parser lands in M1-S4 / M1-S5.
 */
export const EMPTY_BODY: BodyDocument = {
  sections: [],
  warnings: [],
};
