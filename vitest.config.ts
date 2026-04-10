import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 60_000,
    hookTimeout: 120_000,
    include: ['test/**/*.test.ts', 'packages/**/src/__tests__/**/*.test.ts'],
    sequence: {
      concurrent: false,
    },
    fileParallelism: false,
  },
});
