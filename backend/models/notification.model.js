const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Notification = sequelize.define('Notification', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.STRING }, // e.g., 'order', 'appointment', 'system'
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = Notification;