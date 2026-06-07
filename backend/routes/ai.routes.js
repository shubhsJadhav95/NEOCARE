const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Route for AI Symptom Analysis (Preserved)
router.post('/analyze', verifyToken, aiController.analyzeSymptoms);

// NEW: Route for AI Translation (Fixes 404)
router.post('/translate', verifyToken, aiController.analyzeSymptoms); 

module.exports = router;