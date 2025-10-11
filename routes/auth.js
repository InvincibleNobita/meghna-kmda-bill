const express = require('express');
const router = express.Router();
const authController = require('../controllers/controllersauth.controller');
const authMiddleware = require('../middleware/auth');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh authentication token
 * @access Public (with refresh token)
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route POST /api/auth/logout
 * @desc Logout and invalidate tokens
 * @access Private
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @route PUT /api/auth/password
 * @desc Change user password
 * @access Private
 */
router.put('/password', authMiddleware, authController.changePassword);

module.exports = router;