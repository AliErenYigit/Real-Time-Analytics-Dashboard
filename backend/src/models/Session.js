const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define('Session', {
    SessionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    lastActivity: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'sessions',
    timestamps: true,
});
module.exports = Session;