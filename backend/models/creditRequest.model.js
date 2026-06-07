const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const CreditRequest = sequelize.define('CreditRequest', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('buy', 'withdraw'), allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  transactionId: { type: DataTypes.STRING, allowNull: true },
  screenshot: { type: DataTypes.STRING, allowNull: true },
  upiId: { type: DataTypes.STRING, allowNull: true },
  status: { 
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'penalty_applied'), 
    defaultValue: 'pending' 
  },
  penaltyAmount: { type: DataTypes.INTEGER, defaultValue: 0 },
  expiresAt: { type: DataTypes.DATE, allowNull: false } // CreatedAt + 24 Hours
});

module.exports = CreditRequest;