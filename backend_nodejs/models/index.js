const sequelize = require('../database');

// Import tất cả các model
const Category = require('./category');
const Command = require('./command');
const Group = require('./group');
const Project = require('./project');
const Result = require('./result');
const Task = require('./task');
const User = require('./user');

// Thiết lập các quan hệ
Category.hasMany(Task, { foreignKey: 'categoryId', as: 'categoryTasks', onDelete: 'CASCADE' });
Task.belongsTo(Category, { foreignKey: 'categoryId', as: 'taskCategory' });

Task.hasMany(Command, { foreignKey: 'taskId', as: 'taskCommands', onDelete: 'CASCADE' });
Command.belongsTo(Task, { foreignKey: 'taskId', as: 'commandTask' });

Category.hasMany(Category, { foreignKey: 'parentId', as: 'childCategories' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parentCategory' });

Result.belongsTo(Project, { foreignKey: 'projectId', as: 'resultProject' });
Result.belongsTo(User, { foreignKey: 'creatorId', as: 'resultCreator' });

Project.belongsTo(User, { foreignKey: 'creatorId', as: 'projectCreator' });

// Xuất tất cả các model
module.exports = {
    sequelize,
    Category,
    Command,
    Group,
    Project,
    Result,
    Task,
    User,
};
