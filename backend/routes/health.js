const express = require('express');
const router = express.Router();

// Health check endpoint for frontend to verify backend is ready
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

module.exports = router;