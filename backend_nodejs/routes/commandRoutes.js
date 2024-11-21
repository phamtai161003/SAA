const express = require('express');
const {
    createCommand,
    updateCommand,
    deleteCommand,
    getCommandsByTask,
} = require('../controllers/commandController');

const router = express.Router();

// Routes
router.get('/:taskId/commands', getCommandsByTask); // Lấy danh sách commands theo taskId
router.post('/:taskId/commands', createCommand);   // Tạo mới command theo taskId
router.put('/:taskId/commands/:id', updateCommand); // Cập nhật command theo id
router.delete('/:taskId/commands/:id', deleteCommand); // Xóa command theo id

module.exports = router;
