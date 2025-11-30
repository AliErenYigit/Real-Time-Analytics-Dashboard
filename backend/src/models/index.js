const sequelize = require('../config/database');

const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Session = require('./Session');
const CartEvent = require('./CartEvent');

//define

User.hasMany(Order, {foreignKey: 'userId'});
Order.belongsTo(User, {foreignKey: 'userId'});

Order.hasMany(OrderItem, {foreignKey: 'orderId'});
OrderItem.belongsTo(Order, {foreignKey: 'orderId'});

Product.hasMany(OrderItem, {foreignKey: 'productId'});
OrderItem.belongsTo(Product, {foreignKey: 'productId'});

User.hasMany(Session, {foreignKey: 'userId'});
Session.belongsTo(User, {foreignKey: 'userId'});

User.hasMany(CartEvent, {foreignKey: 'userId'});
CartEvent.belongsTo(User, {foreignKey: 'userId'});

Product.hasMany(CartEvent, {foreignKey: 'productId'});
CartEvent.belongsTo(Product, {foreignKey: 'productId'});

module.exports = {
    User,
    Product,
    Order,
    OrderItem,
    Session,
    CartEvent,
    sequelize,
}; 