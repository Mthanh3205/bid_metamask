const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route Đăng ký: http://localhost:5000/api/auth/register
router.post('/register', authController.register);

// Route Đăng nhập: http://localhost:5000/api/auth/login
router.post('/login', authController.login);

module.exports = router;