const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/:userId', verifyToken, notificationController.getUserNotifications);
router.put('/read-all/:userId', verifyToken, notificationController.markAsRead);

// SOS Alert Route
router.post('/emergency-alert', verifyToken, notificationController.triggerEmergencyAlert);

module.exports = router;