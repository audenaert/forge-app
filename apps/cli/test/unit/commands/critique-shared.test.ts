// Unit coverage for `src/commands/critique/shared.ts` — the local helpers
// that live in the critique command group because they don't apply to any
// other artifact type yet.

import { describe, expect, it } from 'vitest';

import {
  OPAQUE_BODY_PLACEHOLDER,
  scaffoldOpaqueBody,
  todayIsoDate,
} from '../../../src/commands/critique/shared.js';

describe('critique/shared.scaffoldOpaqueBody', () => {
  it('returns a single section shaped like the parser would emit', () => {
    const body = scaffoldOpaqueBody();
    expect(body.sections).toHaveLength(1);
    const [section] = body.sections;
    // Heading is empty (opaque body — no H2). Slug/status match what
    // the parser emits for a freshly-read opaque body.
    expect(section?.heading).toBe('');
    expect(section?.slug).toBe('body');
    expect(section?.status).toBe('extra');
    expect(section?.content).toBe(OPAQUE_BODY_PLACEHOLDER);
    expect(body.warnings).toEqual([]);
  });

  it('emits the TODO placeholder content verbatim', () => {
    expect(OPAQUE_BODY_PLACEHOLDER).toBe('_TODO: write critique content_');
  });
});

describe('critique/shared.todayIsoDate', () => {
  it('formats a Date as YYYY-MM-DD in UTC', () => {
    // 2026-04-14 00:00:00 UTC.
    const date = new Date(Date.UTC(2026, 3, 14));
    expect(todayIsoDate(date)).toBe('2026-04-14');
  });

  it('pads single-digit month and day', () => {
    const date = new Date(Date.UTC(2026, 0, 5));
    expect(todayIsoDate(date)).toBe('2026-01-05');
  });

  it('defaults to the current date when no argument is provided', () => {
    expect(todayIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
