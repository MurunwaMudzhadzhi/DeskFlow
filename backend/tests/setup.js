/**
 * tests/setup.js
 * -----------------------------------------------------------------------
 * Runs before the Jest test framework is installed. Sets deterministic
 * environment variables so tests never depend on a real .env file or a
 * live MongoDB connection.
 * -----------------------------------------------------------------------
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-do-not-use-in-production';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
