/**
 * tests/unit/generateToken.test.js
 * -----------------------------------------------------------------------
 * Confirms generateToken produces a JWT that encodes the expected
 * claims and can be verified with the same secret.
 * -----------------------------------------------------------------------
 */

const jwt = require('jsonwebtoken');
const generateToken = require('../../src/utils/generateToken');

describe('generateToken', () => {
  const mockUser = { _id: '665f1a2e8b1a4c0012a3b111', username: 'admin1', role: 'admin' };

  it('produces a token that decodes to the expected id, username, and role', () => {
    const token = generateToken(mockUser);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.id).toBe(mockUser._id);
    expect(decoded.username).toBe(mockUser.username);
    expect(decoded.role).toBe(mockUser.role);
  });

  it('produces a token that fails verification against a different secret', () => {
    const token = generateToken(mockUser);
    expect(() => jwt.verify(token, 'a-completely-different-secret')).toThrow();
  });

  it('includes an expiry (exp) claim in the future', () => {
    const token = generateToken(mockUser);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });
});
