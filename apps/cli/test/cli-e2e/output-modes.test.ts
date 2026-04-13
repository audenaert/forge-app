import { beforeAll, describe, expect, it } from 'vitest';
import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

// ANSI escape matcher — any of the color escapes picocolors emits.
const ANSI_RE = /\u001b\[[0-9;]*m/;

describe('output mode handling', () => {
  beforeAll(() => assertBuiltBin());

  it('--output json emits a single valid JSON envelope with schema=etak-cli/v1', () => {
    const { dir, cleanup } = makeTempProject();
    try {
      const result = runCli(['--output', 'json', 'init'], { cwd: dir });
      expect(result.status).toBe(0);
      const env = parseEnvelope(result.stdout);
      expect(env.schema).toBe('etak-cli/v1');
      expect(env.status).toBe('success');
      expect(env.command).toBe('init');
    } finally {
      cleanup();
    }
  });

  it('--output human emits a human-readable summary (not JSON)', () => {
    const { dir, cleanup } = makeTempProject();
    try {
      const result = runCli(['--output', 'human', 'init'], { cwd: dir });
      expect(result.status).toBe(0);
      // Not JSON-parseable.
      expect(() => JSON.parse(result.stdout.trim())).toThrow();
      expect(result.stdout).toContain('initialized etak project at');
    } finally {
      cleanup();
    }
  });

  it('piped (non-TTY) stdout defaults to JSON output', () => {
    // spawnSync with a pipe makes stdout non-TTY for the child, which is
    // the default behavior we rely on here. No explicit --output flag.
    const { dir, cleanup } = makeTempProject();
    try {
      const result = runCli(['init'], { cwd: dir });
      expect(result.status).toBe(0);
      const env = parseEnvelope(result.stdout);
      expect(env.schema).toBe('etak-cli/v1');
    } finally {
      cleanup();
    }
  });

  it('NO_COLOR=1 strips ANSI escapes from human-mode output', () => {
    const { dir, cleanup } = makeTempProject();
    try {
      const result = runCli(['--output', 'human', 'init'], {
        cwd: dir,
        env: { NO_COLOR: '1' },
      });
      expect(result.status).toBe(0);
      expect(ANSI_RE.test(result.stdout)).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('errors in JSON mode route to stderr, not stdout', () => {
    const { dir, cleanup } = makeTempProject();
    try {
      // Uninitialized + stub command → E_NOT_INITIALIZED on stderr.
      const result = runCli(['--output', 'json', 'idea', 'create'], {
        cwd: dir,
      });
      expect(result.status).toBe(3);
      expect(result.stdout).toBe('');
      const env = parseEnvelope(result.stderr);
      expect(env.status).toBe('error');
    } finally {
      cleanup();
    }
  });

  it('errors in human mode also route to stderr', () => {
    const { dir, cleanup } = makeTempProject();
    try {
      const result = runCli(['--output', 'human', 'idea', 'create'], {
        cwd: dir,
      });
      expect(result.status).toBe(3);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('E_NOT_INITIALIZED');
    } finally {
      cleanup();
    }
  });
});
