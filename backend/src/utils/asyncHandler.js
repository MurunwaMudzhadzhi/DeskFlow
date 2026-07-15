/**
 * utils/asyncHandler.js
 * -----------------------------------------------------------------------
 * Wraps async route/controller functions so that rejected promises are
 * forwarded to Express's centralized error-handling middleware instead of
 * requiring a try/catch block in every controller.
 * -----------------------------------------------------------------------
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
