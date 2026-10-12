/**
 * jest.config.js
 * -----------------------------------------------------------------------
 * Jest configuration for the DeskFlow backend. Most suites run against the
 * Express app with the Mongoose model layer mocked. The *.db.test.js suite
 * runs against an in-memory MongoDB instead, so nothing needs to be
 * installed or running locally.
 *
 * coverageThreshold fails the run if coverage drops below the floor, so a
 * regression can't slip through unnoticed (and CI enforces it on Day 7).
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
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
  },
  verbose: true,
};