import { beforeAll, describe, expect, it } from 'vitest';
import {
  assertBuiltBin,
  makeTempProject,
  parseEnvelope,
  runCli,
} from './helpers.js';

describe('etak unknown command handling', () => {
  beforeAll(() => assertBuiltBin());

  it('`etak wat` exits 4 with a usage-error envelope', () => {
    const result = runCli(['wat']);
    expect(result.status).toBe(4);
    const env = parseEnvelope(result.stderr);
    expect(env.status).toBe('error');
    expect(env.errors[0]?.code).toBe('E_USAGE');
  });

  it('`etak idea wat` exits 4 with a usage-error envelope', () => {
    // In an initialized project so the parent group doesn't exit 3 first.
    const { dir, cleanup } = makeTempProject();
    try {
      runCli(['init'], { cwd: dir });
      const result = runCli(['idea', 'wat'], { cwd: dir });
      expect(result.status).toBe(4);
      const env = parseEnvelope(result.stderr);
      expect(env.errors[0]?.code).toBe('E_USAGE');
    } finally {
      cleanup();
    }
  });
});
