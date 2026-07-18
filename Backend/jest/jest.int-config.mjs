/** @type {import('jest').Config} */
process.env.TZ = 'UTC';

export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
  rootDir: '../',
  testMatch: ['<rootDir>/src/__tests__/**/*.int.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest/setup-integration-tests.ts'],
  globalSetup: '<rootDir>/jest/start-integration.ts',
  globalTeardown: '<rootDir>/jest/stop-integration.ts',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { useESM: true, tsconfig: '<rootDir>/tsconfig.json' },
    ],
  },
  testTimeout: 30000,
};
