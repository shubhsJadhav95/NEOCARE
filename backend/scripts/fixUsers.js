const User = require('../models/user.model');
const db = require('../config/db.config');

const fix = async () => {
  await db.authenticate();
  // Mark all existing users as approved so they show up in the Admin Tower
  await User.update({ status: 'approved', isVerified: true }, { where: {} });
  console.log("✅ Existing users approved. Refresh your Dashboard!");
  process.exit();
};
fix();