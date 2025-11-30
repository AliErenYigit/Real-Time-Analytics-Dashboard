const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {

    orderDate: {
        type: DataTypes.ENUM('pending', 'paid', 'shipped', 'canceled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    totalPrice:{
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    tableName: 'orders',
    timestamps: true,
});

module.exports = Order;