const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Category = require('./category');

const Task = sequelize.define('Task', {
    name: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        validate: { 
            notEmpty: true, // Không cho phép giá trị rỗng
            len: [3, 255], // Độ dài từ 3 đến 255 ký tự
        },
    },
    slug: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true, // Đảm bảo slug là duy nhất
        validate: { 
            notEmpty: true, // Không cho phép giá trị rỗng
        },
    },
    combine: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        validate: { 
            notEmpty: true, // Không cho phép giá trị rỗng
        },
    },
    scored: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false, // Mặc định là false
    },
    remediation: { 
        type: DataTypes.TEXT, 
        allowNull: true, 
        validate: { 
            len: [0, 1000], // Giới hạn tối đa 1000 ký tự
        },
    },
    note: { 
        type: DataTypes.TEXT, 
        allowNull: true, 
        validate: { 
            len: [0, 1000], // Giới hạn tối đa 1000 ký tự
        },
    },
}, {
    tableName: 'tasks', // Đặt tên bảng là 'tasks'
    timestamps: true, // Thêm các cột createdAt và updatedAt
});

// Định nghĩa quan hệ
Category.hasMany(Task, { foreignKey: 'categoryId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = Task;
