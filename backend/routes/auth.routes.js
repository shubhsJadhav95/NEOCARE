const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/register', upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'degree_photo', maxCount: 1 },
  { name: 'shop_photo', maxCount: 1 },
  { name: 'license_photo', maxCount: 1 }
]), authController.register);

router.post('/login', authController.login);
router.get('/doctors', authController.getAllDoctors);

// NEW ROUTES: Essential for Profile.jsx and DashboardLayout
router.get('/me', verifyToken, authController.getMe);
router.get('/profile/:id', verifyToken, authController.getMe); // Fixed: Map ID for Dashboard fetch

// FIXED: Added /:id strictly to match the frontend request /api/auth/update-profile/4
router.put('/update-profile', verifyToken, authController.updateProfile);
router.put('/update-profile/:id', verifyToken, authController.updateProfile);

// --- STRICTLY ADDED: WORKOUT STREAK & REWARD ROUTE ---
// Matches frontend request: API.post('/auth/complete-workout', ...)
router.post('/complete-workout', verifyToken, authController.completeWorkout);

module.exports = router;