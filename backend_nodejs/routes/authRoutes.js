const express = require('express');
const { login } = require('../controllers/authController'); // Controller đăng nhập

const router = express.Router();

router.post('/login', login); // Route đăng nhập

module.exports = router;   