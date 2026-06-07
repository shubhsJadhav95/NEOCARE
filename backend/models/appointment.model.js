const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Appointment = sequelize.define('Appointment', {
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  doctorId: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  status: { 
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'), 
    defaultValue: 'pending' 
  },
  treatmentType: {
    type: DataTypes.ENUM('offline', 'online'),
    defaultValue: 'offline'
  },
  meetingLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // NEW LOGIC: Follow-up and Billing (Strictly Preserved)
  isFollowUp: { type: DataTypes.BOOLEAN, defaultValue: false },
  billingType: { type: DataTypes.ENUM('fixed', 'per_visit'), defaultValue: 'per_visit' },
  nextFollowUpDate: { type: DataTypes.DATE, allowNull: true },
  
  // LOGIC: Required for Invisibility Logic
  followUpExpiry: { type: DataTypes.DATE, allowNull: true }
});

module.exports = Appointment;