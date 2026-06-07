const Review = require('../models/review.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');

exports.addReview = async (req, res) => {
  try {
    const { userId, medicineId, rating, comment } = req.body;

    // Logic: Verify if the user has purchased this medicine and it was delivered
    const hasPurchased = await Order.findOne({
      where: {
        patientId: userId,
        medicineId: medicineId,
        status: 'delivered'
      }
    });

    if (!hasPurchased) {
      return res.status(403).json({ 
        message: "You can only review medicines that have been delivered to you." 
      });
    }

    // Logic: Check if user already reviewed this medicine
    const existingReview = await Review.findOne({ where: { userId, medicineId } });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product." });
    }

    const review = await Review.create({
      userId,
      medicineId,
      rating,
      comment
    });

    res.status(201).json({ message: "Review added successfully", review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMedicineReviews = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const reviews = await Review.findAll({
      where: { medicineId },
      include: [{ model: User, as: 'user', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};