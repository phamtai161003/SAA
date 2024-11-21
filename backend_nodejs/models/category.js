const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Category = sequelize.define('Category', {
    name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    slug: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true 
    },
    cmd: { 
        type: DataTypes.TEXT, 
        allowNull: true 
    },
    expect_output: { 
        type: DataTypes.TEXT, 
        allowNull: true 
    },
    parentId: { 
        type: DataTypes.INTEGER, 
        allowNull: true 
    },
}, {
    tableName: 'categories', // Đặt tên bảng rõ ràng
    timestamps: true, // Bật timestamps (createdAt, updatedAt)
});

// Định nghĩa associations bên ngoài
Category.associate = (models) => {
    Category.hasMany(models.Task, { foreignKey: 'categoryId', as: 'tasks' });
    Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });
    Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' }); // Quan hệ ngược lại
};

module.exports = Category;
