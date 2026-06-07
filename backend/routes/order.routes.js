const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload'); 

// 1. Patient places order
router.post('/place', verifyToken, upload.single('prescription_photo'), orderController.placeOrder);

// 2. Pharmacist fetches their orders
router.get('/pharmacist/:pharmacistId', verifyToken, orderController.getPharmacistOrders);

// 3. Patient fetches their orders
router.get('/patient/:patientId', verifyToken, orderController.getPatientOrders);

// 4. Update status (Dispatch/Approve/Reject)
// Standard route used by the platform
router.put('/update-status/:id', verifyToken, orderController.updateOrderStatus);

// Fallback to prevent 404s if legacy code calls /update/
router.put('/update/:id', verifyToken, orderController.updateOrderStatus); 

module.exports = router;