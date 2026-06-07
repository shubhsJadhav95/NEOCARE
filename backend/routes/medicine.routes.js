const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicine.controller');
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth.middleware');

// INVENTORY ROUTES
// Note: The controller for getInventory must be updated to 'include' Reviews for real-time NLP
router.get('/inventory/:pharmacistId', verifyToken, medicineController.getInventory);
router.post('/add', verifyToken, upload.single('medicine_photo'), medicineController.addMedicine);
router.get('/all', medicineController.getAllMedicines);
router.put('/update/:id', verifyToken, upload.single('medicine_photo'), medicineController.updateMedicine);

// DETAIL & RECOMMENDATION ROUTES
router.get('/details/:id', verifyToken, medicineController.getMedicineDetails);
router.get('/recommendations', verifyToken, medicineController.getRecommendations);
router.post('/review/:id', verifyToken, medicineController.addReview);

// --- NEW: SMART GROCERY INTEGRATION ROUTE ---
// Logic: Receives ingredient list from Recipe Finder and returns matching MediMart products
router.post('/match-ingredients', verifyToken, medicineController.findGroceryMatches);

module.exports = router;