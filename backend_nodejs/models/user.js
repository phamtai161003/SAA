const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Đảm bảo đường dẫn đúng đến file db.js

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        password: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        is_superuser: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        username: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
        },
        first_name: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        last_name: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(254),
            allowNull: false,
            unique: true,
        },
        is_staff: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        date_joined: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        crypto_key: {
            type: DataTypes.STRING(6),
            unique: true,
            defaultValue: () => {
                const crypto = require('crypto');
                return crypto.randomBytes(3).toString('hex'); // Tạo chuỗi 6 ký tự
            },
        },
    },
    {
        tableName: 'users', // Đảm bảo bảng đúng tên
        timestamps: true, // Cung cấp `createdAt` và `updatedAt`
    }
);

module.exports = User;
