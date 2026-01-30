const express = require('express');
const { signIn } = require('../controllers/signInController');

const router = express.Router();

router.post('/signin', signIn);

module.exports = router;