const sequelize = require('./config/db.config');
const User = require('./models/user.model');
const Medicine = require('./models/medicine.model'); // Ensure path is correct

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: false });

    // Seed Doctors
    await User.bulkCreate([
      {
        name: "Dr. Ananya Iyer",
        email: "ananya@neocare.com",
        password: "password123", // Will be hashed by hook
        role: "doctor",
        specialist: "Cardiologist",
        working_hours: "08:00 AM - 02:00 PM",
        college_name: "AIIMS Delhi"
      },
      {
        name: "Dr. Vikram Mehra",
        email: "vikram@neocare.com",
        password: "password123",
        role: "doctor",
        specialist: "Dermatologist",
        working_hours: "04:00 PM - 09:00 PM",
        college_name: "CMC Vellore"
      }
    ], { validate: true, individualHooks: true });

    // Seed Medicines
    await Medicine.bulkCreate([
      { name: "Paracetamol 500mg", price: 40, category: "Fever", stock: 100, description: "Standard pain relief" },
      { name: "Amoxicillin", price: 120, category: "Antibiotic", stock: 50, description: "Bacterial infections" },
      { name: "Cetirizine", price: 35, category: "Allergy", stock: 200, description: "Relief from hay fever" }
    ]);

    console.log("🌱 Database Seeded Successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding Failed:", err);
    process.exit(1);
  }
};

seedDatabase();