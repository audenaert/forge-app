import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  AdapterError,
  NotFoundError,
  ValidationError,
} from '../../../src/adapters/errors.js';
import { classifyError, runCommand } from '../../../src/errors/boundary.js';
import { envelopeSuccess, type Envelope } from '../../../src/output/envelope.js';
import { UsageError } from '../../../src/errors/exit-codes.js';

function makeStreams() {
  const stdout: string[] = [];
  const stderr: string[] = [];
  return {
    stdout: { write: (s: string) => (stdout.push(s), true) },
    stderr: { write: (s: string) => (stderr.push(s), true) },
    out: stdout,
    err: stderr,
  };
}

describe('classifyError', () => {
  it('flattens a ZodError into per-issue structured errors', () => {
    const schema = z.object({ status: z.enum(['draft', 'shipped']) });
    const parsed = schema.safeParse({ status: 'drafy' });
    if (parsed.success) throw new Error('expected zod failure');
    const structured = classifyError(parsed.error);
    expect(structured.length).toBe(1);
    expect(structured[0]?.code).toBe('E_VALIDATION');
    expect(structured[0]?.location?.field).toBe('status');
  });

  it('projects AdapterBaseError subclasses via toStructuredError', () => {
    const err = new ValidationError('bad frontmatter', {
      location: { field: 'frontmatter.status' },
    });
    const out = classifyError(err);
    expect(out.length).toBe(1);
    expect(out[0]?.code).toBe('E_VALIDATION');
    expect(out[0]?.location?.field).toBe('frontmatter.status');
  });

  it('maps NotFoundError to E_NOT_FOUND', () => {
    const out = classifyError(new NotFoundError('missing slug'));
    expect(out[0]?.code).toBe('E_NOT_FOUND');
  });

  it('maps AdapterError to its configured code', () => {
    const out = classifyError(
      new AdapterError('permission denied', { code: 'E_PERMISSION' }),
    );
    expect(out[0]?.code).toBe('E_PERMISSION');
  });

  it('maps UsageError to E_USAGE', () => {
    const out = classifyError(new UsageError('unknown command foo'));
    expect(out[0]?.code).toBe('E_USAGE');
  });

  it('best-effort handles plain Errors', () => {
    const out = classifyError(new Error('oops'));
    expect(out[0]?.code).toBe('E_INTERNAL');
    expect(out[0]?.message).toBe('oops');
  });

  it('best-effort handles non-Error throws', () => {
    expect(classifyError('string')[0]?.code).toBe('E_INTERNAL');
    expect(classifyError(42)[0]?.code).toBe('E_INTERNAL');
  });
});

describe('runCommand', () => {
  it('returns 0 on success and writes to stdout', async () => {
    const streams = makeStreams();
    const code = await runCommand<{ ok: true }>({
      command: 'init',
      mode: 'json',
      streams,
      handler: async () => envelopeSuccess('init', { ok: true }),
    });
    expect(code).toBe(0);
    expect(streams.out.length).toBe(1);
    expect(streams.err.length).toBe(0);
    const parsed = JSON.parse(streams.out[0]!) as Envelope;
    expect(parsed.status).toBe('ok');
  });

  it('catches ValidationError, writes to stderr, returns 1', async () => {
    const streams = makeStreams();
    const code = await runCommand({
      command: 'init',
      mode: 'json',
      streams,
      handler: async () => {
        throw new ValidationError('bad --root');
      },
    });
    expect(code).toBe(1);
    expect(streams.out.length).toBe(0);
    expect(streams.err.length).toBe(1);
    const parsed = JSON.parse(streams.err[0]!) as Envelope;
    expect(parsed.status).toBe('error');
    expect(parsed.errors[0]?.code).toBe('E_VALIDATION');
  });

  it('catches NotFoundError and returns 2', async () => {
    const streams = makeStreams();
    const code = await runCommand({
      command: 'idea get',
      mode: 'json',
      streams,
      handler: async () => {
        throw new NotFoundError('no such slug');
      },
    });
    expect(code).toBe(2);
    const parsed = JSON.parse(streams.err[0]!) as Envelope;
    expect(parsed.errors[0]?.code).toBe('E_NOT_FOUND');
  });

  it('catches AdapterError and returns 3', async () => {
    const streams = makeStreams();
    const code = await runCommand({
      command: 'idea create',
      mode: 'json',
      streams,
      handler: async () => {
        throw new AdapterError('io failure', { code: 'E_NOT_INITIALIZED' });
      },
    });
    expect(code).toBe(3);
    const parsed = JSON.parse(streams.err[0]!) as Envelope;
    expect(parsed.errors[0]?.code).toBe('E_NOT_INITIALIZED');
  });

  it('catches UsageError and returns 4', async () => {
    const streams = makeStreams();
    const code = await runCommand({
      command: 'idea create',
      mode: 'json',
      streams,
      handler: async () => {
        throw new UsageError('not implemented');
      },
    });
    expect(code).toBe(4);
  });

  it('flattens a thrown ZodError into envelope errors', async () => {
    const streams = makeStreams();
    const schema = z.object({ n: z.number() });
    const code = await runCommand({
      command: 'idea update',
      mode: 'json',
      streams,
      handler: async () => {
        schema.parse({ n: 'not a number' });
        throw new Error('unreachable');
      },
    });
    expect(code).toBe(1);
    const parsed = JSON.parse(streams.err[0]!) as Envelope;
    expect(parsed.errors[0]?.code).toBe('E_VALIDATION');
    expect(parsed.errors[0]?.location?.field).toBe('n');
  });

  it('renders human mode when mode=human', async () => {
    const streams = makeStreams();
    await runCommand<{ x: number }>({
      command: 'init',
      mode: 'human',
      streams,
      color: false,
      handler: async () => envelopeSuccess('init', { x: 1 }),
      humanSummary: (d) => `got ${d.x}`,
    });
    expect(streams.out[0]).toContain('got 1');
  });
});
