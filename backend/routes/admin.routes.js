const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// --- PLATFORM OVERVIEW & VERIFICATION ---
router.get('/overview', [verifyToken, isAdmin], adminController.getOverview);
router.post('/verify-user', [verifyToken, isAdmin], adminController.verifyUser);
router.get('/users', [verifyToken, isAdmin], adminController.getAllUsers);
router.get('/orders', [verifyToken, isAdmin], adminController.getAllOrders);

// --- SETTINGS & FEES ---
router.get('/settings', [verifyToken, isAdmin], adminController.getSettings);
router.post('/settings', [verifyToken, isAdmin], adminController.updateSettings);

// --- MEDICINE RECOMMENDATION WORKFLOW ---
router.post('/recommend-medicine', [verifyToken], adminController.recommendMedicine);
router.get('/recommendation-stats', [verifyToken, isAdmin], adminController.getRecommendationStats);
router.post('/push-medicine', [verifyToken, isAdmin], adminController.pushToPharmacists);
router.get('/pushed-count', [verifyToken], adminController.getPushedCount);
router.get('/pushed-medicines', [verifyToken], adminController.getPushedMedicines);
router.post('/mark-handled', [verifyToken], adminController.markRecommendationHandled);

// --- USER CONTROL & WARNING WORKFLOW ---
router.post('/warn-user/:userId', [verifyToken, isAdmin], adminController.warnUser);
router.post('/restore-user/:userId', [verifyToken, isAdmin], adminController.restoreUser);
router.delete('/delete-user/:userId', [verifyToken, isAdmin], adminController.deleteUserAccount);

// --- FRAUD & SECURITY REPORTING ---
// STRICTLY ADDED: Allows patients to report doctors (Protected by Token)
router.post('/report-doctor', [verifyToken], adminController.reportDoctor);

module.exports = router;