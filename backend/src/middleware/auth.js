/**
 * middleware/auth.js
 * -----------------------------------------------------------------------
 * authenticateJWT  - Verifies the Bearer token on protected routes and
 *                     attaches the decoded payload to req.user.
 * authorizeEmployee - Restricts a route to users with role "employee".
 * authorizeAdmin    - Restricts a route to users with role "admin".
 * -----------------------------------------------------------------------
 */

const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'No token provided. Authorization header must be "Bearer <token>".'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role, iat, exp }
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Session expired. Please log in again.'));
    }
    return next(new ApiError(401, 'Invalid token.'));
  }
};

const authorizeEmployee = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Not authenticated.'));
  }
  if (req.user.role !== 'employee') {
    return next(new ApiError(403, 'Access denied. Employee role required.'));
  }
  return next();
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Not authenticated.'));
  }
  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'Access denied. Admin role required.'));
  }
  return next();
};

module.exports = { authenticateJWT, authorizeEmployee, authorizeAdmin };
