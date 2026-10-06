const path = require('path');

module.exports = {
  testEnvironment: 'node',
  rootDir: path.resolve(__dirname, '..'),
  transform: {
    '^.+\\.(ts|tsx)$': [
      'babel-jest',
      {
        presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.(ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>/jest/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
