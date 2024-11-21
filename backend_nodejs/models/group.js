const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Group = sequelize.define('Group', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Đảm bảo tên nhóm là duy nhất
        validate: {
            notEmpty: true, // Không cho phép giá trị rỗng
            len: [3, 50], // Tên phải có độ dài từ 3 đến 50 ký tự
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: [0, 500], // Mô tả tối đa 500 ký tự
        },
    },
}, {
    tableName: 'groups', // Tên bảng rõ ràng
    timestamps: true, // Thêm các cột createdAt và updatedAt
});

module.exports = Group;
