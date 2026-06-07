const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Medicine = sequelize.define('Medicine', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  pharmacistId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  name: { type: DataTypes.STRING, allowNull: false },
  manufacturer: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  expiryDate: { type: DataTypes.DATEONLY, allowNull: false },
  medicine_photo: { type: DataTypes.STRING, allowNull: true },
  requiresPrescription: { type: DataTypes.BOOLEAN, defaultValue: false },
  discount: { type: DataTypes.INTEGER, defaultValue: 0 },
  // Status field to prevent FK Deletion errors
  status: { 
    type: DataTypes.ENUM('active', 'expired', 'out_of_stock'), 
    defaultValue: 'active' 
  },
  description: { type: DataTypes.TEXT, allowNull: true },
  highlights: { type: DataTypes.TEXT, allowNull: true }, 
  safety_info: { type: DataTypes.TEXT, allowNull: true }
});

module.exports = Medicine;