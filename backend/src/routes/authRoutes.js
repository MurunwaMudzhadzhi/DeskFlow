/**
 * routes/authRoutes.js
 * -----------------------------------------------------------------------
 * Authentication routes: login and current-user profile.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { login, getMe } = require('../controllers/authController');
const { loginValidation } = require('../middleware/validators');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate a user (employee or admin) and issue a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             username: employee1
 *             password: Employee@123
 *             role: employee
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidation, login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the currently authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticateJWT, getMe);

module.exports = router;
