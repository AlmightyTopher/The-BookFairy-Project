import { jest } from '@jest/globals';

// Global test timeout
jest.setTimeout(30000);

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Setup global error handlers
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection in tests:', error);
});
