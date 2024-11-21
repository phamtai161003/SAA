const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Result = sequelize.define('Result', {
    name: { type: DataTypes.STRING, allowNull: false },
    created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    modified: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    ip: { type: DataTypes.STRING },
    os: { type: DataTypes.STRING },
    result: { type: DataTypes.BOOLEAN, defaultValue: false },
    pass_num: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_num: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_hidden: { type: DataTypes.BOOLEAN, defaultValue: false },
    projectId: { type: DataTypes.INTEGER, allowNull: false },
    creatorId: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'results',
    timestamps: true,
    updatedAt: 'modified',
});

module.exports = Result;
