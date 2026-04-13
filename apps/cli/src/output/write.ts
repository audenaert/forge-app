// Envelope writer. Routes rendered output to stdout or stderr per the
// design spec §4.4:
//
//   - stdout: success envelopes (JSON or human)
//   - stderr: error envelopes (JSON or human)
//
// Drift warnings are part of the envelope and travel with whichever stream
// carries the primary output — they do not split. In JSON mode the warnings
// are on the envelope the consumer parses; in human mode they render as a
// compact block after the success summary or after the error lines.

import type { Envelope } from './envelope.js';
import { renderHuman, type RenderHumanOptions } from './render.js';
import { renderJson } from './render.js';
import type { OutputMode } from './tty.js';

export interface StreamPair {
  stdout: Pick<NodeJS.WriteStream, 'write'>;
  stderr: Pick<NodeJS.WriteStream, 'write'>;
}

export interface WriteResultOptions<T> {
  /** Custom one-line human summary for success envelopes. */
  humanSummary?: (data: T) => string;
  /** Force color on/off; leave unset in production. */
  color?: boolean;
}

export function writeResult<T>(
  envelope: Envelope<T>,
  mode: OutputMode,
  streams: StreamPair,
  opts: WriteResultOptions<T> = {},
): void {
  const target = envelope.status === 'success' ? streams.stdout : streams.stderr;

  if (mode === 'json') {
    target.write(renderJson(envelope));
    return;
  }

  const humanOpts: RenderHumanOptions<T> = {};
  if (opts.humanSummary !== undefined) humanOpts.summary = opts.humanSummary;
  if (opts.color !== undefined) humanOpts.color = opts.color;
  target.write(renderHuman(envelope, humanOpts));
}
