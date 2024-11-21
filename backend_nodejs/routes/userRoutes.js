const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, getCurrentUser } = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');

// Routes
router.get('/', authenticate, getUsers);            // Lấy danh sách người dùng
router.post('/', authenticate, createUser);         // Tạo người dùng mới
router.patch('/:id', authenticate, updateUser);     // Cập nhật thông tin người dùng
router.get('/me', authenticate, getCurrentUser);    // Lấy thông tin người dùng hiện tại

module.exports = router;
