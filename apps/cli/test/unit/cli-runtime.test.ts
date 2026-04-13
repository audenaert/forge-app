import { describe, expect, it } from 'vitest';
import { peekGlobalFlags, peekRawOutput } from '../../src/cli-runtime.js';

// These tests guard the argv pre-parse layer. Two invariants matter:
//   1. The peeks must not short-circuit exit-code semantics — the only
//      reason they exist is to surface `--output` validation errors as
//      exit 1 instead of commander's default exit 4 (see cli-runtime.ts).
//   2. The peeks must respect POSIX `--` end-of-options: in M2+, commands
//      will accept trailing positional args that may contain literal
//      flag-looking strings (e.g. `etak idea create -- --output in prose`).

describe('peekRawOutput', () => {
  it('returns the value of --output <mode>', () => {
    expect(peekRawOutput(['--output', 'json'])).toBe('json');
    expect(peekRawOutput(['--output', 'human'])).toBe('human');
  });

  it('returns the value of --output=<mode>', () => {
    expect(peekRawOutput(['--output=json'])).toBe('json');
  });

  it('returns the value of -o <mode>', () => {
    expect(peekRawOutput(['-o', 'json'])).toBe('json');
  });

  it('returns undefined when --output is absent', () => {
    expect(peekRawOutput(['init'])).toBeUndefined();
    expect(peekRawOutput([])).toBeUndefined();
  });

  it('returns the raw (possibly invalid) value for validation to catch', () => {
    expect(peekRawOutput(['--output', 'yaml'])).toBe('yaml');
  });

  it('stops at a bare `--` separator (POSIX end-of-options)', () => {
    // `--output` after `--` is a positional, not a flag. Peek must not
    // return it; falls through to the default mode.
    expect(peekRawOutput(['--', '--output', 'json'])).toBeUndefined();
    expect(peekRawOutput(['idea', 'create', '--', '--output'])).toBeUndefined();
  });

  it('still honors --output before a `--` separator', () => {
    expect(peekRawOutput(['--output', 'json', '--', '--output', 'yaml'])).toBe('json');
  });

  it('does not crash when -o is the last token (no value following)', () => {
    // When `-o` is the last argv entry, argv[i+1] is undefined. We return
    // that undefined so the caller falls back to the default mode rather
    // than blowing up. If the user meant to pass a value and forgot, they
    // will discover the miss on retry.
    expect(() => peekRawOutput(['init', '-o'])).not.toThrow();
    expect(peekRawOutput(['init', '-o'])).toBeUndefined();
  });

  it('does not crash when --output is the last token (no value following)', () => {
    expect(() => peekRawOutput(['init', '--output'])).not.toThrow();
    expect(peekRawOutput(['init', '--output'])).toBeUndefined();
  });

  it('treats --output appearing inside a quoted post-`--` arg as positional', () => {
    // Simulates the shell having already tokenized a quoted arg like
    // `"embedded --output in prose"` into a single argv entry. The entry
    // doesn't equal `--output`, but even a bare one after `--` must not
    // trigger mode switching.
    const argv = ['idea', 'create', '--', 'embedded --output in prose'];
    expect(peekRawOutput(argv)).toBeUndefined();
  });
});

describe('peekGlobalFlags', () => {
  it('returns output when --output <mode> is well-formed', () => {
    expect(peekGlobalFlags(['--output', 'json'])).toEqual({ output: 'json' });
    expect(peekGlobalFlags(['--output', 'human'])).toEqual({ output: 'human' });
  });

  it('returns output when --output=<mode> is well-formed', () => {
    expect(peekGlobalFlags(['--output=json'])).toEqual({ output: 'json' });
  });

  it('ignores unknown --output values (validation happens via peekRawOutput)', () => {
    expect(peekGlobalFlags(['--output', 'yaml'])).toEqual({});
  });

  it('sets color=false for --no-color and color=true for --color', () => {
    expect(peekGlobalFlags(['--no-color'])).toEqual({ color: false });
    expect(peekGlobalFlags(['--color'])).toEqual({ color: true });
  });

  it('stops scanning at a bare `--` separator', () => {
    // `--output json` after `--` must not be honored.
    expect(peekGlobalFlags(['--', '--output', 'json'])).toEqual({});
    // `--no-color` after `--` must not be honored.
    expect(peekGlobalFlags(['init', '--', '--no-color'])).toEqual({});
  });

  it('still honors flags appearing BEFORE the `--` separator', () => {
    expect(
      peekGlobalFlags(['--output', 'json', '--no-color', '--', '--color']),
    ).toEqual({ output: 'json', color: false });
  });

  it('does not crash when -o is the last token', () => {
    expect(() => peekGlobalFlags(['init', '-o'])).not.toThrow();
    // No well-formed value → output stays undefined.
    expect(peekGlobalFlags(['init', '-o'])).toEqual({});
  });
});
