const express = require('express');
const router = express.Router();
const trackerController = require('../controllers/tracker.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/update', verifyToken, trackerController.updateDailyTracker);
router.get('/history/:userId', verifyToken, trackerController.getTrackerHistory);

module.exports = router;