import { defineConfig } from 'vitest/config';

/**
 * Vitest config for @etak/cli.
 *
 * Three project roots per the design spec:
 *   - unit               — schema / formatter / slug unit tests
 *   - adapter-contract   — shared adapter contract suite
 *   - cli-e2e            — end-to-end tests that spawn the built binary
 *
 * Each project owns its own `test/<project>/` directory. Empty directories are
 * kept alive with `.gitkeep` files so the structure is visible before tests
 * are written.
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'adapter-contract',
          include: ['test/adapter-contract/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'cli-e2e',
          include: ['test/cli-e2e/**/*.test.ts'],
          environment: 'node',
          testTimeout: 30_000,
        },
      },
    ],
  },
});
