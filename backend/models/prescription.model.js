const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  appointmentId: { type: DataTypes.INTEGER, allowNull: false },
  doctorId: { type: DataTypes.INTEGER, allowNull: false },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  diagnosis: { type: DataTypes.TEXT, allowNull: false },
  medicines: {
    type: DataTypes.TEXT, 
    allowNull: false,
    // Automatically parse string to JSON when reading from DB
    get() {
      const rawValue = this.getDataValue('medicines');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    // Automatically stringify JSON when saving to DB
    set(value) {
      this.setDataValue('medicines', JSON.stringify(value));
    }
  },
  notes: { type: DataTypes.TEXT, allowNull: true }
});

module.exports = Prescription;