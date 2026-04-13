// Envelope renderers: `json` for pipeable output, `human` for interactive
// terminals. Both consume the same `Envelope` — the human renderer is a
// projection, not an independent formatter, so drift between the two is
// impossible by construction.
//
// Coloring uses `picocolors` (tiny, zero transitive deps) which already
// respects `NO_COLOR`. To support tests that force-enable or force-disable
// color regardless of the ambient env, we re-resolve picocolors with
// `isColorSupported = false` in `renderHumanPlain`.

import pc from 'picocolors';
import type { DriftWarning, StructuredError } from '../schemas/index.js';
import type { Envelope } from './envelope.js';

/**
 * Serialize an envelope to a single line of JSON plus a trailing newline,
 * matching the design spec §4.1 ("every JSON-mode command emits exactly
 * one JSON object on stdout, followed by a newline"). Consumers that want
 * pretty printing can pipe through `jq`.
 */
export function renderJson(envelope: Envelope): string {
  return `${JSON.stringify(envelope)}\n`;
}

/**
 * Human-mode rendering. Success and error envelopes take different shapes:
 *   - success: one-line summary derived from `data` (caller-defined via the
 *     `summary` option), followed by any warnings block.
 *   - error: red "error:" lines for each structured error, then warnings.
 *
 * The summary is a callback so each command handler can shape its own
 * one-liner without the renderer having to know about command-specific
 * payloads. If no summary callback is provided, we emit a generic
 * "<command> ok" line.
 */
export interface RenderHumanOptions<T> {
  summary?: (data: T) => string;
  /**
   * Force color on or off regardless of the ambient environment. Primarily
   * for tests; production code should leave this unset and let picocolors
   * read `NO_COLOR` / TTY detection from the environment.
   */
  color?: boolean;
}

export function renderHuman<T>(
  envelope: Envelope<T>,
  opts: RenderHumanOptions<T> = {},
): string {
  const colors = resolveColors(opts.color);
  const lines: string[] = [];

  if (envelope.status === 'ok') {
    const summary = opts.summary
      ? opts.summary(envelope.data as T)
      : `${envelope.command} ok`;
    lines.push(colors.green(summary));
  } else {
    // Error envelope: one red "error:" line per structured error.
    for (const err of envelope.errors) {
      lines.push(formatErrorLine(err, colors));
    }
    if (envelope.errors.length === 0) {
      // Defensive: an error envelope with no errors. Emit something useful
      // instead of rendering nothing.
      lines.push(colors.red(`error: ${envelope.command} failed`));
    }
  }

  for (const warning of envelope.warnings) {
    lines.push(formatWarningLine(warning, colors));
  }

  return `${lines.join('\n')}\n`;
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

type ColorFn = (s: string) => string;
interface ColorFns {
  red: ColorFn;
  yellow: ColorFn;
  gray: ColorFn;
  green: ColorFn;
  dim: ColorFn;
}

function resolveColors(force: boolean | undefined): ColorFns {
  if (force === false) {
    const id: ColorFn = (s) => s;
    return { red: id, yellow: id, gray: id, green: id, dim: id };
  }
  const src = force === true ? pc.createColors(true) : pc;
  // picocolors' Formatter accepts string|number|null|undefined; we only ever
  // pass strings, so narrow the signature here.
  return {
    red: (s) => String(src.red(s)),
    yellow: (s) => String(src.yellow(s)),
    gray: (s) => String(src.gray(s)),
    green: (s) => String(src.green(s)),
    dim: (s) => String(src.dim(s)),
  };
}

function formatErrorLine(err: StructuredError, colors: ColorFns): string {
  const head = colors.red(`error [${err.code}]:`);
  const field = err.location?.field ? ` ${colors.dim(err.location.field)}` : '';
  return `${head}${field} ${err.message}`;
}

function formatWarningLine(w: DriftWarning, colors: ColorFns): string {
  const severityColor =
    w.severity === 'warning' ? colors.yellow : colors.gray;
  const head = severityColor(`${w.severity} [${w.kind}]:`);
  const section = w.location?.section ? ` ${colors.dim(`§${w.location.section}`)}` : '';
  return `${head}${section} ${w.message}`;
}
