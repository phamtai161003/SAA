const express = require('express');
const {
    createTask,
    updateTask,
    deleteTask,
    getTasksByCategory,
} = require('../controllers/taskController');

const router = express.Router();

// Routes
router.get('/:categoryId/tasks', getTasksByCategory);  // Lấy danh sách tasks theo category
router.post('/:categoryId/tasks', createTask);        // Tạo mới task theo category
router.put('/:categoryId/tasks/:id', updateTask);     // Cập nhật task theo ID
router.delete('/:categoryId/tasks/:id', deleteTask);  // Xóa task theo ID

module.exports = router;
