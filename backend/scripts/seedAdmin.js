const User = require('../models/user.model');
const db = require('../config/db.config');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await db.authenticate();
    
    // Check if admin already exists
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@neocare.com',
        password: 'admin123', // This will be hashed automatically by the User model hook
        role: 'admin',
        status: 'approved',
        isVerified: true
      });
      console.log('✅ Admin account created: admin@neocare.com / admin123');
    } else {
      console.log('ℹ️ Admin account already exists.');
    }
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();