const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Setting = sequelize.define('Setting', {
  key: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: 'unique_setting_key' // Using a named index prevents duplicates
  },
  value: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  }
}, {
  timestamps: true
});

module.exports = Setting;