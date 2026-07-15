/**
 * tests/unit/errorHandler.test.js
 * -----------------------------------------------------------------------
 * Confirms the centralized error handler normalizes Mongoose validation,
 * duplicate-key, and cast errors into consistent HTTP responses.
 * -----------------------------------------------------------------------
 */

const { errorHandler, notFound } = require('../../src/middleware/errorHandler');

const buildRes = () => {
  const res = {};
  res.statusCode = 200;
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('errorHandler', () => {
  it('uses the error statusCode and message when present (e.g. from ApiError)', () => {
    const err = { statusCode: 403, message: 'Access denied. Admin role required.' };
    const res = buildRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Access denied. Admin role required.' })
    );
  });

  it('normalizes a Mongoose ValidationError to 400 with a details array', () => {
    const err = {
      name: 'ValidationError',
      message: 'ticket validation failed',
      errors: {
        title: { message: 'Title must be at least 5 characters long' },
        priority: { message: 'Priority is required' },
      },
    };
    const res = buildRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toBe('Validation failed');
    expect(payload.details).toEqual(
      expect.arrayContaining(['Title must be at least 5 characters long', 'Priority is required'])
    );
  });

  it('normalizes a Mongo duplicate key error (11000) to 400 with a field-specific message', () => {
    const err = { code: 11000, keyValue: { username: 'employee1' } };
    const res = buildRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toMatch(/username already exists/i);
  });

  it('normalizes a Mongoose CastError (bad ObjectId) to 400', () => {
    const err = { name: 'CastError', path: '_id', value: 'not-a-valid-id' };
    const res = buildRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toMatch(/invalid _id/i);
  });

  it('falls back to 500 for an unrecognized error shape', () => {
    const err = new Error('Something exploded');
    const res = buildRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toBe('Something exploded');
  });

  it('omits the stack trace in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const err = new Error('Sensitive internal detail');
    const res = buildRes();
    errorHandler(err, {}, res, jest.fn());

    const payload = res.json.mock.calls[0][0];
    expect(payload.stack).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });
});

describe('notFound', () => {
  it('sets status 404 and forwards an error describing the missing route', () => {
    const req = { method: 'GET', originalUrl: '/api/does-not-exist' };
    const res = { status: jest.fn() };
    const next = jest.fn();

    notFound(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.message).toMatch(/GET \/api\/does-not-exist/);
  });
});
