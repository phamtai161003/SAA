const express = require('express');
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();

// Middleware bảo vệ (nếu cần, ví dụ: xác thực)
const authenticate = require('../middlewares/authenticate'); // Middleware xác thực giả định

// Định nghĩa các routes
router.get('/', getCategories); // Lấy danh sách categories
router.get('/:id', getCategoryById); // Lấy thông tin category theo ID
router.post('/', authenticate, createCategory); // Tạo mới category (yêu cầu xác thực)
router.put('/:id', authenticate, updateCategory); // Cập nhật category (yêu cầu xác thực)
router.delete('/:id', authenticate, deleteCategory); // Xóa category (yêu cầu xác thực)

module.exports = router;
