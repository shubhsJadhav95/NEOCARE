const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  pharmacistId: { type: DataTypes.INTEGER, allowNull: false },
  medicineId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  // NEW: Store prescription proof
  prescription_photo: { type: DataTypes.STRING, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending_verification', 'pending', 'dispatched', 'delivered', 'cancelled', 'rejected'),
    defaultValue: 'pending'
  }
});

module.exports = Order;