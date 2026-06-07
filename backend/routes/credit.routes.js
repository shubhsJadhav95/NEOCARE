const express = require('express');
const router = express.Router();
const creditController = require('../controllers/credit.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/request', verifyToken, upload.single('screenshot'), creditController.createRequest);
router.get('/my-requests/:userId', verifyToken, creditController.getUserRequests);
router.post('/pay-doctor', verifyToken, creditController.payDoctor);
router.post('/deduct-checkout', verifyToken, creditController.deductCheckout); // NEW

router.get('/admin/all', verifyToken, isAdmin, creditController.getAllRequests);
router.get('/admin/stats', verifyToken, isAdmin, creditController.getFinanceStats);
router.put('/admin/approve/:id', verifyToken, isAdmin, creditController.approveRequest);

module.exports = router;