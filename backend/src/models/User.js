// src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    // satıcı sen olacağın için "role" alanını da ekledim
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('seller', 'customer'),
      defaultValue: 'customer',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

module.exports = User;
