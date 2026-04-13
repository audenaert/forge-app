import { describe, expect, it } from 'vitest';
import { detectOutputMode, parseOutputMode } from '../../../src/output/tty.js';

describe('detectOutputMode', () => {
  it('returns the explicit mode when passed', () => {
    expect(
      detectOutputMode({ explicit: 'json', stdout: { isTTY: true } }),
    ).toBe('json');
    expect(
      detectOutputMode({ explicit: 'human', stdout: { isTTY: false } }),
    ).toBe('human');
  });

  it('defaults to human on a TTY', () => {
    expect(detectOutputMode({ stdout: { isTTY: true } })).toBe('human');
  });

  it('defaults to json when stdout is not a TTY', () => {
    expect(detectOutputMode({ stdout: { isTTY: false } })).toBe('json');
    expect(detectOutputMode({ stdout: { isTTY: undefined } })).toBe('json');
  });
});

describe('parseOutputMode', () => {
  it('accepts human and json', () => {
    expect(parseOutputMode('human')).toBe('human');
    expect(parseOutputMode('json')).toBe('json');
  });

  it('throws on unknown values', () => {
    expect(() => parseOutputMode('wat')).toThrow(/human/);
    expect(() => parseOutputMode('')).toThrow();
  });
});
