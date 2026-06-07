const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// 1. Add a new review (Requires login)
router.post('/add', verifyToken, reviewController.addReview);

// 2. Get all reviews for a specific medicine
router.get('/medicine/:medicineId', reviewController.getMedicineReviews);

module.exports = router;