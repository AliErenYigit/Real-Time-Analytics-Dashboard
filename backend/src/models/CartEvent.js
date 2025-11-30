const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const CartEvent = sequelize.define('CartEvent', {
    eventType: {
        type: DataTypes.ENUM("add", "remove", "update"),
        allowNull: false,
    },
},
{
    tableName: 'cart_events',
    timestamps: true,
}); 
module.exports = CartEvent;