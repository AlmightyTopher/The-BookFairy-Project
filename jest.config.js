module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
  restoreMocks: true
};
