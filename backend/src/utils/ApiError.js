/**
 * utils/ApiError.js
 * -----------------------------------------------------------------------
 * Custom error class carrying an HTTP status code so the centralized
 * error handler can respond with the correct code and message.
 * -----------------------------------------------------------------------
 */

class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
