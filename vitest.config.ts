/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.ts', 'tests/**/*.test.ts', 'tests/**/*.test.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    testTimeout: 30000
  },
});
