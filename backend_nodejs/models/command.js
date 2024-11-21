const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Task = require('./task');

// Định nghĩa model Command
const Command = sequelize.define('Command', {
    operator: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        validate: { 
            notEmpty: true // Đảm bảo không rỗng 
        } 
    },
    cmd: { 
        type: DataTypes.TEXT, 
        allowNull: false, 
        validate: { 
            notEmpty: true // Đảm bảo không rỗng
        }
    },
    expect: { 
        type: DataTypes.TEXT, 
        allowNull: false, 
        validate: { 
            notEmpty: true // Đảm bảo không rỗng
        }
    },
    parser: { 
        type: DataTypes.TEXT, 
        allowNull: true 
    },
}, {
    tableName: 'commands', // Tên bảng rõ ràng
    timestamps: true, // Tự động thêm cột createdAt và updatedAt
});

// Định nghĩa quan hệ
Task.hasMany(Command, { foreignKey: 'taskId', as: 'commands', onDelete: 'CASCADE' });
Command.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

module.exports = Command;
