const express = require('express');
const { logout } = require('../controllers/logoutController');
const { authenticateToken } = require('../middleware/authenticateToken');

const router = express.Router();

router.post('/logout', authenticateToken, logout);

module.exports = router;