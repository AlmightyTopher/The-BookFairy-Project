import { beforeEach, vi } from 'vitest';

// Global test timeout is configured in vitest.config.ts

// Clear mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Setup global error handlers
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection in tests:', error);
});
