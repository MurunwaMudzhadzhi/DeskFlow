/**
 * tests/unit/auth.middleware.test.js
 * -----------------------------------------------------------------------
 * Exercises authenticateJWT, authorizeEmployee, and authorizeAdmin in
 * isolation using hand-built req/res/next mocks, with no Express app
 * or database involved.
 * -----------------------------------------------------------------------
 */

const jwt = require('jsonwebtoken');
const { authenticateJWT, authorizeEmployee, authorizeAdmin } = require('../../src/middleware/auth');

const buildRes = () => ({}); // authenticateJWT never touches res directly on the success path
const buildNext = () => jest.fn();

const signToken = (payload, options = {}) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h', ...options });

describe('authenticateJWT', () => {
  it('calls next() with no error and attaches decoded payload when the token is valid', () => {
    const token = signToken({ id: 'u1', username: 'employee1', role: 'employee' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = buildNext();

    authenticateJWT(req, buildRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(); // called with no error
    expect(req.user).toMatchObject({ id: 'u1', username: 'employee1', role: 'employee' });
  });

  it('calls next(error) with 401 when no Authorization header is present', () => {
    const req = { headers: {} };
    const next = buildNext();

    authenticateJWT(req, buildRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  it('calls next(error) with 401 when the header does not start with "Bearer "', () => {
    const req = { headers: { authorization: 'Token abc123' } };
    const next = buildNext();

    authenticateJWT(req, buildRes(), next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  it('calls next(error) with 401 when the token is malformed/invalid', () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } };
    const next = buildNext();

    authenticateJWT(req, buildRes(), next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.message).toMatch(/invalid token/i);
  });

  it('calls next(error) with 401 and an expiry-specific message when the token has expired', () => {
    const token = signToken({ id: 'u1', username: 'employee1', role: 'employee' }, { expiresIn: '-10s' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = buildNext();

    authenticateJWT(req, buildRes(), next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.message).toMatch(/expired/i);
  });
});

describe('authorizeEmployee', () => {
  it('calls next() with no error when req.user.role is "employee"', () => {
    const req = { user: { role: 'employee' } };
    const next = buildNext();

    authorizeEmployee(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(error) with 403 when req.user.role is "admin"', () => {
    const req = { user: { role: 'admin' } };
    const next = buildNext();

    authorizeEmployee(req, buildRes(), next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
  });

  it('calls next(error) with 401 when req.user is missing entirely', () => {
    const req = {};
    const next = buildNext();

    authorizeEmployee(req, buildRes(), next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });
});

describe('authorizeAdmin', () => {
  it('calls next() with no error when req.user.role is "admin"', () => {
    const req = { user: { role: 'admin' } };
    const next = buildNext();

    authorizeAdmin(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(error) with 403 when req.user.role is "employee"', () => {
    const req = { user: { role: 'employee' } };
    const next = buildNext();

    authorizeAdmin(req, buildRes(), next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
  });
});
