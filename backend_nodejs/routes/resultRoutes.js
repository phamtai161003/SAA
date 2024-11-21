const express = require('express');
const {
    uploadResult,
    downloadResult,
    deleteResult,
    editResult,
    getResults,
} = require('../controllers/resultController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// Routes
router.get('/', authenticate, getResults);                // Lấy danh sách kết quả
router.post('/upload', authenticate, uploadResult);       // Upload file
router.get('/download', authenticate, downloadResult);    // Tải file
router.delete('/delete', authenticate, deleteResult);     // Xóa file
router.patch('/edit/:id', authenticate, editResult);      // Chỉnh sửa kết quả

module.exports = router;
