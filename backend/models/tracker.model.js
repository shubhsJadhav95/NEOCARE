const { DataTypes } = require('sequelize');
const db = require('../config/db.config');

const Tracker = db.define('Tracker', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    waterIntake: { type: DataTypes.INTEGER, defaultValue: 0 },
    calories: { type: DataTypes.INTEGER, defaultValue: 0 },
    meals: { type: DataTypes.JSON, defaultValue: [] }
}, {
    indexes: [{ unique: true, fields: ['userId', 'date'] }]
});

module.exports = Tracker;