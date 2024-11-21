const express = require('express');

// Import các route riêng
const publicRouter = express.Router();
const protectedRouter = express.Router();

// Route không yêu cầu xác thực
const authRoutes = require('./authRoutes');
publicRouter.use('/', authRoutes); // Public routes như login, register

// Route yêu cầu xác thực
const categoryRoutes = require('./categoryRoutes');
const taskRoutes = require('./taskRoutes');
const commandRoutes = require('./commandRoutes');
const datasetRoutes = require('./datasetRoutes');
const resultRoutes = require('./resultRoutes');
const userRoutes = require('./userRoutes');
const projectRoutes = require('./projectRoutes');
const groupRoutes = require('./groupRoutes');

// Thứ tự các route cụ thể trước tổng quát
protectedRouter.use('/categories/:category_id/tasks', taskRoutes);
protectedRouter.use('/tasks/:task_id/commands', commandRoutes);
protectedRouter.use('/categories', categoryRoutes);
protectedRouter.use('/dataset', datasetRoutes);
protectedRouter.use('/results', resultRoutes);
protectedRouter.use('/users', userRoutes);
protectedRouter.use('/projects', projectRoutes);
protectedRouter.use('/groups', groupRoutes);

module.exports = {
    authRoutes: publicRouter,
    protectedRoutes: protectedRouter,
};
