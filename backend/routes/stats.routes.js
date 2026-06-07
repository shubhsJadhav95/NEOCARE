const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Existing Stats Routes
router.get('/patient/:userId', verifyToken, statsController.getPatientStats);
router.get('/doctor/:userId', verifyToken, statsController.getDoctorStats);
router.get('/pharmacist/:userId', verifyToken, statsController.getPharmacistStats);
router.get('/pharmacist-analytics/:pharmacistId', verifyToken, statsController.getPharmacistAnalytics);

// FIX: New route to handle revenue breakdown
router.get('/pharmacist-revenue/:pharmacistId', verifyToken, statsController.getPharmacistRevenue);

module.exports = router;