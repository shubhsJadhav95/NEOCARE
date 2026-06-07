const Medicine = require('../models/medicine.model');
const User = require('../models/user.model');
const Setting = require('../models/setting.model');
const Review = require('../models/review.model');
const { Op } = require('sequelize');

exports.addMedicine = async (req, res) => {
  try {
    const { name, manufacturer, category, price, stock, expiryDate, pharmacistId, requiresPrescription, discount, description, highlights, safety_info } = req.body;
    
    const existingMed = await Medicine.findOne({
      where: { name, manufacturer, price: parseFloat(price), expiryDate, pharmacistId: parseInt(pharmacistId) }
    });

    if (existingMed) {
      existingMed.stock += parseInt(stock);
      existingMed.status = 'active'; // Reset status if new stock is added
      if (req.file) existingMed.medicine_photo = req.file.path;
      await existingMed.save();
      return res.status(200).json(existingMed);
    }

    const medicine = await Medicine.create({
      name, manufacturer, category,
      price: parseFloat(price),
      stock: parseInt(stock),
      expiryDate,
      pharmacistId: parseInt(pharmacistId),
      requiresPrescription: requiresPrescription === 'true' || requiresPrescription === true,
      discount: parseInt(discount) || 0,
      description, highlights, safety_info,
      medicine_photo: req.file ? req.file.path : null,
      status: 'active'
    });
    res.status(201).json(medicine);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findByPk(id);
    if (!medicine) return res.status(404).json({ message: "Not found" });
    
    const updateData = {
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      category: req.body.category,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      expiryDate: req.body.expiryDate,
      requiresPrescription: req.body.requiresPrescription === 'true' || req.body.requiresPrescription === true,
      discount: parseInt(req.body.discount) || 0,
      description: req.body.description,
      highlights: req.body.highlights,
      safety_info: req.body.safety_info
    };

    // Auto-update status based on stock
    updateData.status = updateData.stock <= 0 ? 'out_of_stock' : 'active';

    if (req.file) updateData.medicine_photo = req.file.path;
    await medicine.update(updateData);
    res.json({ message: "Updated", medicine });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getInventory = async (req, res) => {
  try {
    const inventory = await Medicine.findAll({
      where: { pharmacistId: req.params.pharmacistId },
      // STRICTLY ADDED: Include reviews so NLP Analytics can work in real-time
      include: [{
        model: Review,
        as: 'reviews'
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(inventory);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllMedicines = async (req, res) => {
  try {
    const markupSetting = await Setting.findOne({ where: { key: 'fee_pharmacist' } });
    const markupPercent = markupSetting ? parseFloat(markupSetting.value) : 10;
    
    // Only fetch ACTIVE medicines for the shop
    const medicines = await Medicine.findAll({
      where: { status: 'active' },
      include: [{ model: User, as: 'pharmacist', attributes: ['name', 'shop_name', 'address'] }],
      order: [['createdAt', 'DESC']]
    });

    const mappedMeds = medicines.map(med => {
      const basePrice = parseFloat(med.price);
      const discountedBase = basePrice - (basePrice * (med.discount / 100));
      const finalPrice = discountedBase + (discountedBase * (markupPercent / 100));
      return {
        ...med.toJSON(),
        price: finalPrice.toFixed(2), 
        oldPrice: (basePrice + (basePrice * (markupPercent / 100))).toFixed(2),
        isDiscounted: med.discount > 0
      };
    });
    res.json(mappedMeds);
  } catch (err) { res.status(500).json({ message: "Error", error: err.message }); }
};

exports.getMedicineDetails = async (req, res) => {
  try {
    const medicine = await Medicine.findByPk(req.params.id, {
      include: [
        { model: User, as: 'pharmacist', attributes: ['shop_name'] },
        { model: Review, as: 'reviews', include: [{ model: User, as: 'user', attributes: ['name'] }] }
      ]
    });
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });

    const markupSetting = await Setting.findOne({ where: { key: 'fee_pharmacist' } });
    const markupPercent = markupSetting ? parseFloat(markupSetting.value) : 10;
    const basePrice = parseFloat(medicine.price);
    const discountedBase = basePrice - (basePrice * (medicine.discount / 100));
    const finalPrice = discountedBase + (discountedBase * (markupPercent / 100));

    const avgRating = medicine.reviews.length > 0 
      ? (medicine.reviews.reduce((acc, rev) => acc + rev.rating, 0) / medicine.reviews.length).toFixed(1)
      : 0;

    res.json({
      ...medicine.toJSON(),
      price: finalPrice.toFixed(2),
      oldPrice: (basePrice + (basePrice * (markupPercent / 100))).toFixed(2),
      averageRating: avgRating,
      reviewCount: medicine.reviews.length
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { category, excludeId } = req.query;
    const meds = await Medicine.findAll({
      where: { category, id: { [Op.ne]: excludeId }, status: 'active' },
      limit: 6
    });
    res.json(meds);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addReview = async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;
    const medicineId = req.params.id;
    const review = await Review.create({ userId, medicineId, rating, comment });
    res.status(201).json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- NEW: SMART GROCERY INTEGRATION ---
// Logic: Searches for store products that match recipe ingredients
exports.findGroceryMatches = async (req, res) => {
  try {
    const { ingredients } = req.body; // Expects an array of strings
    if (!ingredients || ingredients.length === 0) return res.json([]);

    const matches = await Medicine.findAll({
      where: {
        [Op.or]: ingredients.map(ing => ({
          [Op.or]: [
            { name: { [Op.like]: `%${ing}%` } },
            { highlights: { [Op.like]: `%${ing}%` } },
            { description: { [Op.like]: `%${ing}%` } }
          ]
        })),
        status: 'active',
        stock: { [Op.gt]: 0 }
      },
      attributes: ['id', 'name', 'price', 'medicine_photo', 'stock', 'discount']
    });

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: "Error matching ingredients", error: err.message });
  }
};

module.exports = {
    addMedicine: exports.addMedicine,
    updateMedicine: exports.updateMedicine,
    getInventory: exports.getInventory,
    getAllMedicines: exports.getAllMedicines,
    getMedicineDetails: exports.getMedicineDetails,
    getRecommendations: exports.getRecommendations,
    addReview: exports.addReview,
    findGroceryMatches: exports.findGroceryMatches // STRICTLY EXPORTED
};