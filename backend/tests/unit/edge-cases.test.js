/**
 * tests/unit/edge-cases.test.js
 * -----------------------------------------------------------------------
 * Day 3: closes the unit-level gaps listed in docs/TEST_PLAN.md (G1, G2).
 * -----------------------------------------------------------------------
 */

const jwt = require('jsonwebtoken');
const { authorizeAdmin } = require('../../src/middleware/auth');
const { errorHandler } = require('../../src/middleware/errorHandler');
const generateToken = require('../../src/utils/generateToken');

describe('authorizeAdmin (edge cases)', () => {
  it('calls next(error) with 401 when req.user is missing entirely', () => {
    const next = jest.fn();

    authorizeAdmin({}, {}, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });
});

describe('generateToken expiry configuration', () => {
  const user = { _id: 'u1', username: 'employee1', role: 'employee' };
  const original = process.env.JWT_EXPIRES_IN;

  afterEach(() => {
    if (original === undefined) delete process.env.JWT_EXPIRES_IN;
    else process.env.JWT_EXPIRES_IN = original;
  });

  it('defaults to an 8 hour expiry when JWT_EXPIRES_IN is not set', () => {
    delete process.env.JWT_EXPIRES_IN;

    const decoded = jwt.decode(generateToken(user));

    expect(decoded.exp - decoded.iat).toBe(8 * 60 * 60);
  });

  it('uses JWT_EXPIRES_IN when it is set', () => {
    process.env.JWT_EXPIRES_IN = '1h';

    const decoded = jwt.decode(generateToken(user));

    expect(decoded.exp - decoded.iat).toBe(60 * 60);
  });
});

describe('errorHandler (branch coverage)', () => {
  const buildRes = (statusCode = 200) => {
    const res = { statusCode };
    res.status = jest.fn((code) => {
      res.statusCode = code;
      return res;
    });
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('keeps a non-200 status already set on res when the error has no statusCode', () => {
    const res = buildRes(404);

    errorHandler(new Error('Route not found'), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('uses a generic message for a duplicate key error with no keyValue', () => {
    const res = buildRes();

    errorHandler({ code: 11000, message: 'E11000 duplicate key' }, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Duplicate field value' }));
  });

  it('uses a generic message for a duplicate key error with an empty keyValue', () => {
    const res = buildRes();

    errorHandler({ code: 11000, message: 'E11000 duplicate key', keyValue: {} }, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Duplicate field value' }));
  });
});