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
  testMatch: ['<rootDir>/src/__tests__/**/*.unit.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { useESM: true, tsconfig: '<rootDir>/tsconfig.json' },
    ],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/contracts/**',
    '!src/__tests__/**',
  ],
  coverageDirectory: '<rootDir>/coverage/unit',
  testTimeout: 20000,
  forceExit: true,
};
