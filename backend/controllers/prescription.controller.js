const Prescription = require('../models/prescription.model');
const User = require('../models/user.model');
// Load the clinical map for medicine-nutrient interactions
const interactionGuard = require('../data/interactionGuard.json'); 

exports.createPrescription = async (req, res) => {
  try {
    // The model's 'set' logic handles the stringify automatically
    // Now req.body includes 'dietTag' from the new WritePrescription form
    const prescription = await Prescription.create(req.body);
    res.status(201).json(prescription);
  } catch (err) {
    console.error("Prescription Create Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      where: { patientId: req.params.patientId },
      include: [{ 
        model: User, 
        as: 'doctor', 
        attributes: ['name', 'specialist', 'profile_photo'] 
      }],
      order: [['createdAt', 'DESC']]
    });

    // We convert the Sequelize objects to plain JSON to ensure the 'get' logic is applied
    const cleanPrescriptions = prescriptions.map(p => p.get({ plain: true }));
    
    res.json(cleanPrescriptions);
  } catch (err) {
    console.error("Fetch Prescriptions Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// --- NEW: Nutri-Care Context Engine ---
// Logic: Prepares medical context for the Healthy Recipe Finder
exports.getPatientDietaryContext = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Fetch the absolute latest prescription to get active Diet Tags and Meds
    const latestRx = await Prescription.findOne({
      where: { patientId },
      order: [['createdAt', 'DESC']]
    });

    if (!latestRx) {
      return res.json({ 
        dietTag: 'General Wellness', 
        activeMeds: [], 
        safetyWarnings: [] 
      });
    }

    // Use the Sequelize getter/plain logic to access the medicines array
    const rxData = latestRx.get({ plain: true });
    const medicines = rxData.medicines || [];
    const activeMeds = medicines.map(m => m.name.toLowerCase());
    
    // Cross-reference current meds with interactionGuard JSON data
    const safetyWarnings = [];
    activeMeds.forEach(medName => {
      // Check if medicine has known food interactions
      if (interactionGuard[medName]) {
        safetyWarnings.push({
          medicine: medName,
          restrictedFoods: interactionGuard[medName].interactsWith,
          message: interactionGuard[medName].message,
          severity: interactionGuard[medName].severity
        });
      }
    });

    res.json({
      dietTag: rxData.dietTag || 'General Wellness',
      activeMeds: activeMeds,
      safetyWarnings: safetyWarnings
    });
  } catch (err) {
    console.error("Dietary Context Error:", err);
    res.status(500).json({ message: "Error building dietary context" });
  }
};