/**
 * controllers/authController.js
 * -----------------------------------------------------------------------
 * Handles authentication logic. Login validates credentials against the
 * User collection, and returns a signed JWT along with role/username.
 * -----------------------------------------------------------------------
 */

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Authenticate a user and return a JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;

  // Explicitly select password since the schema excludes it by default
  const user = await User.findOne({ username }).select('+password');

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid username or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid username or password');
  }

  // If the client specified an expected role (from the role selector),
  // enforce that it matches the account's actual role.
  if (role && role !== user.role) {
    throw new ApiError(401, `This account is not registered as ${role}.`);
  }

  const token = generateToken(user);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      role: user.role,
      username: user.username,
      fullName: user.fullName,
      department: user.department,
    },
  });
});

/**
 * @desc    Return the currently authenticated user's profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return res.status(200).json({ success: true, data: user });
});

module.exports = { login, getMe };
