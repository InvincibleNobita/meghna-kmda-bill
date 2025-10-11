const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const rulesRoutes = require('./rules');
const statsRoutes = require('./stats');
const usersRoutes = require('./users');

// API version prefix
const API_PREFIX = '/api';

// Mount routes
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/rules`, rulesRoutes);
router.use(`${API_PREFIX}/stats`, statsRoutes);
router.use(`${API_PREFIX}/users`, usersRoutes);

// API health check endpoint
router.get(`${API_PREFIX}/health`, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'DNS Control System API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// Handle 404 for API routes
router.use(`${API_PREFIX}/*`, (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found'
  });
});

module.exports = router;