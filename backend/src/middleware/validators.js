/**
 * middleware/validators.js
 * -----------------------------------------------------------------------
 * express-validator validation chains, plus a shared "runValidation"
 * middleware that inspects the validation result and returns 400 with
 * a structured list of errors if any rule failed.
 * -----------------------------------------------------------------------
 */

const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new ApiError(400, 'Validation failed', formatted));
  }
  return next();
};

// ---------------------------------------------------------------------
// Auth validators
// ---------------------------------------------------------------------
const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['employee', 'admin'])
    .withMessage('Role must be either "employee" or "admin"'),
  runValidation,
];

// ---------------------------------------------------------------------
// Ticket validators
// ---------------------------------------------------------------------
const createTicketValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 120 })
    .withMessage('Title must be between 5 and 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be one of: Low, Medium, High'),
  body('category')
    .optional()
    .isIn(['Hardware', 'Software', 'Network', 'Access', 'Other'])
    .withMessage('Invalid category'),
  runValidation,
];

const updateTicketStatusValidation = [
  param('id').isMongoId().withMessage('Invalid ticket id'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Open', 'In Progress', 'Resolved'])
    .withMessage('Status must be one of: Open, In Progress, Resolved'),
  body('resolutionNotes').optional().isLength({ max: 1000 }).withMessage('Resolution notes too long'),
  runValidation,
];

const getTicketsValidation = [
  query('status').optional().isIn(['Open', 'In Progress', 'Resolved']),
  query('priority').optional().isIn(['Low', 'Medium', 'High']),
  query('search').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  runValidation,
];

module.exports = {
  runValidation,
  loginValidation,
  createTicketValidation,
  updateTicketStatusValidation,
  getTicketsValidation,
};
