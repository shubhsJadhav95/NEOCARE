const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { 
    type: DataTypes.ENUM('admin', 'patient', 'doctor', 'pharmacist'), 
    allowNull: false 
  },
  profile_photo: { type: DataTypes.STRING },
  status: { 
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'warned'), 
    defaultValue: 'pending' 
  },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },

  // --- NEW: CREDIT FIELD ---
  credits: { type: DataTypes.FLOAT, defaultValue: 0 },

  // --- DOCTOR FIELDS ---
  registration_number: { type: DataTypes.STRING, allowNull: true }, // STRICTLY ADDED FOR GOVT VERIFICATION
  working_hours: { type: DataTypes.STRING, defaultValue: "09:00 AM - 05:00 PM" },
  degree: { type: DataTypes.STRING },
  degree_photo: { type: DataTypes.STRING },
  specialist: { type: DataTypes.STRING },
  college_name: { type: DataTypes.STRING },
  years_of_experience: { type: DataTypes.INTEGER },
  lat: { type: DataTypes.FLOAT, allowNull: true },
  lon: { type: DataTypes.FLOAT, allowNull: true },
  billingType: { type: DataTypes.ENUM('fixed', 'per_visit'), defaultValue: 'per_visit' },

  // --- PATIENT FIELDS ---
  age: { type: DataTypes.INTEGER },
  blood_group: { type: DataTypes.STRING },
  contact_number: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  allergies: { type: DataTypes.TEXT },
  past_diseases: { type: DataTypes.TEXT },
  emergency_number: { type: DataTypes.STRING },
  emergency_contact_name: { type: DataTypes.STRING },
  emergency_contact_email: { type: DataTypes.STRING },

  // --- PHARMACIST FIELDS ---
  shop_name: { type: DataTypes.STRING },
  shop_address: { type: DataTypes.TEXT },
  shop_photo: { type: DataTypes.STRING },
  license_number: { type: DataTypes.STRING },
  license_photo: { type: DataTypes.STRING },

  // --- WARNING LOGIC FIELD ---
  deletionWarnedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null }
}, {
  hooks: {
    beforeCreate: async (user) => {
      // STRICT: Encrypt password before saving to database
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
      // STRICT: Patients and Admins are approved by default
      if (user.role === 'patient' || user.role === 'admin') {
        user.status = 'approved';
      }
    }
  }
});

module.exports = User;