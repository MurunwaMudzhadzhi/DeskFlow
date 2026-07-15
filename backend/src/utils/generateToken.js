/**
 * utils/generateToken.js
 * -----------------------------------------------------------------------
 * Generates a signed JWT containing the user's id, username, and role.
 * -----------------------------------------------------------------------
 */

const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
};

module.exports = generateToken;
