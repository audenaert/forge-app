// Parameterized coverage of every exit-code path the chassis exposes in
// M1-S5. Exit 2 is only reachable at the unit level in this story — no
// chassis-only command produces a NotFoundError (that's M1-S6 territory),
// so it's covered in `test/unit/errors/boundary.test.ts` instead.

import { beforeAll, describe, expect, it } from 'vitest';
import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('exit code matrix (chassis-only, M1-S5)', () => {
  beforeAll(() => assertBuiltBin());

  it('exit 0: `etak init` in a fresh tempdir', () => {
    const { dir, cleanup } = makeTempProject();
    try {
      const result = runCli(['init'], { cwd: dir });
      expect(result.status).toBe(0);
    } finally {
      cleanup();
    }
  });

  it('exit 1: `etak --output wat init` (bad --output value)', () => {
    const { dir, cleanup } = makeTempProject();
    try {
      const result = runCli(['--output', 'wat', 'init'], { cwd: dir });
      expect(result.status).toBe(1);
      const env = parseEnvelope(result.stderr);
      expect(env.errors[0]?.code).toBe('E_VALIDATION');
    } finally {
      cleanup();
    }
  });

  it('exit 3: non-init command in an uninitialized project', () => {
    const { dir, cleanup } = makeTempProject();
    try {
      // `opportunity get foo` is still a stub in M1 but proves the
      // context walk-up runs before the stub handler. For an
      // uninitialized project the walk-up throws E_NOT_INITIALIZED (exit
      // 3) before the stub's UsageError ever fires.
      const result = runCli(['opportunity', 'get', 'foo'], {
        cwd: dir,
        // Important: also pin the walk-up start so test harness's own
        // parent directory can never supply a stray .etak/.
        env: { ETAK_ROOT: '' },
      });
      expect(result.status).toBe(3);
      const env = parseEnvelope(result.stderr);
      expect(env.errors[0]?.code).toBe('E_NOT_INITIALIZED');
      expect(env.errors[0]?.message).toMatch(/etak init/);
    } finally {
      cleanup();
    }
  });

  it('exit 4: unknown top-level command', () => {
    const result = runCli(['wat']);
    expect(result.status).toBe(4);
    const env = parseEnvelope(result.stderr);
    expect(env.errors[0]?.code).toBe('E_USAGE');
  });

  it('exit 4: stub handler in an initialized project', () => {
    // The five non-idea types remain stubs in M1-S6. Use `opportunity`
    // to exercise the "context wired, handler throws UsageError" path.
    const { dir, cleanup } = makeTempProject();
    try {
      runCli(['init'], { cwd: dir });
      const result = runCli(['opportunity', 'create'], { cwd: dir });
      expect(result.status).toBe(4);
      const env = parseEnvelope(result.stderr);
      expect(env.errors[0]?.code).toBe('E_USAGE');
      expect(env.errors[0]?.message).toMatch(/not implemented in M1/);
    } finally {
      cleanup();
    }
  });
});
