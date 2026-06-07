const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Recommendation = sequelize.define('Recommendation', {
  medicineName: { type: DataTypes.STRING, allowNull: false },
  reason: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'pushed'), defaultValue: 'pending' }
});

module.exports = Recommendation;