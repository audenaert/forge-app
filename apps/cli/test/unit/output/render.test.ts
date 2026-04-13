import { describe, expect, it } from 'vitest';
import {
  envelopeError,
  envelopeSuccess,
} from '../../../src/output/envelope.js';
import { renderHuman, renderJson } from '../../../src/output/render.js';

// Strip ANSI escape sequences so assertions can match on plain text even
// when picocolors has decided to emit colors.
// Note: tests use `color: false` to deterministically disable coloring;
// this regex is only used as a belt-and-braces sanity check.
const ANSI_RE = /\u001b\[[0-9;]*m/g;
function stripAnsi(s: string): string {
  return s.replace(ANSI_RE, '');
}

describe('renderJson', () => {
  it('serializes the envelope as a single line with a trailing newline', () => {
    const env = envelopeSuccess('init', { root: '/tmp/x' });
    const out = renderJson(env);

    expect(out.endsWith('\n')).toBe(true);
    const parsed = JSON.parse(out) as typeof env;
    expect(parsed.schema).toBe('etak-cli.v1');
    expect(parsed.status).toBe('ok');
    expect(parsed.data).toEqual({ root: '/tmp/x' });
  });

  it('preserves warnings and errors', () => {
    const env = envelopeError('idea create', [
      { code: 'E_VALIDATION', message: 'bad' },
    ]);
    const parsed = JSON.parse(renderJson(env)) as typeof env;
    expect(parsed.errors.length).toBe(1);
    expect(parsed.data).toBeNull();
  });
});

describe('renderHuman', () => {
  it('renders success with a default summary when no summary callback given', () => {
    const env = envelopeSuccess('init', { root: '/tmp/x' });
    const out = stripAnsi(renderHuman(env, { color: false }));
    expect(out).toContain('init ok');
    expect(out.endsWith('\n')).toBe(true);
  });

  it('uses the caller-provided summary for success', () => {
    const env = envelopeSuccess('init', { root: '/tmp/x', created: [] });
    const out = renderHuman(env, {
      color: false,
      summary: (d) => `initialized at ${(d as { root: string }).root}`,
    });
    expect(out).toContain('initialized at /tmp/x');
  });

  it('renders errors with code, message, and optional field path', () => {
    const env = envelopeError('idea create', [
      {
        code: 'E_VALIDATION',
        message: 'status must be one of draft, exploring',
        location: { field: 'frontmatter.status' },
      },
    ]);
    const out = stripAnsi(renderHuman(env, { color: false }));
    expect(out).toContain('error [E_VALIDATION]:');
    expect(out).toContain('frontmatter.status');
    expect(out).toContain('status must be one of');
  });

  it('renders warnings after the primary output', () => {
    const env = envelopeSuccess(
      'idea update',
      { slug: 'x' },
      [
        {
          kind: 'extra_section',
          severity: 'info',
          message: 'author added "Links"',
        },
      ],
    );
    const out = stripAnsi(renderHuman(env, { color: false }));
    const summaryIdx = out.indexOf('idea update ok');
    const warnIdx = out.indexOf('info [extra_section]:');
    expect(summaryIdx).toBeGreaterThanOrEqual(0);
    expect(warnIdx).toBeGreaterThan(summaryIdx);
  });

  it('strips all color when color=false', () => {
    const env = envelopeError('init', [
      { code: 'E_IO', message: 'disk full' },
    ]);
    const out = renderHuman(env, { color: false });
    // No ANSI escapes at all.
    expect(ANSI_RE.test(out)).toBe(false);
  });

  it('emits color escapes when color=true', () => {
    const env = envelopeError('init', [
      { code: 'E_IO', message: 'disk full' },
    ]);
    const out = renderHuman(env, { color: true });
    expect(ANSI_RE.test(out)).toBe(true);
  });

  it('defensively renders a generic error line when errors[] is empty on an error envelope', () => {
    // Not a shape the factory will produce, but we guard against it.
    const env = envelopeError('etak', []);
    const out = stripAnsi(renderHuman(env, { color: false }));
    expect(out).toContain('error: etak failed');
  });
});
