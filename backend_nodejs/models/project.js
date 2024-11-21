const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Project = sequelize.define('Project', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true, // Không cho phép giá trị rỗng
            len: [3, 255], // Độ dài từ 3 đến 255 ký tự
        },
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Mặc định là true
    },
    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Bảng tham chiếu (bạn cần chắc chắn bảng 'users' tồn tại)
            key: 'id',
        },
    },
    created: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Mặc định là ngày giờ hiện tại
    },
    modified: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'projects', // Đặt tên bảng là 'projects'
    timestamps: true, // Bật createdAt và updatedAt
    updatedAt: 'modified', // Sử dụng 'modified' thay vì 'updatedAt'
});

module.exports = Project;
