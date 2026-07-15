/**
 * jest.config.js
 * -----------------------------------------------------------------------
 * Jest configuration for the DeskFlow backend. Tests run against the
 * Express app in isolation with the Mongoose model layer mocked, so no
 * live MongoDB connection is required to run the suite.
 * -----------------------------------------------------------------------
 */

module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/middleware/**/*.js',
    'src/utils/**/*.js',
    '!src/utils/seed.js',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
