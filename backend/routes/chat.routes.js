const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Fix: Ensure these functions are defined in chat.controller.js
router.get('/contacts/:userId', verifyToken, chatController.getActiveContacts);
router.get('/history/:userId/:otherId', verifyToken, chatController.getChatHistory);

module.exports = router;