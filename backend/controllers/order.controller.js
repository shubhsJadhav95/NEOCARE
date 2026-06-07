const Order = require('../models/order.model');
const Medicine = require('../models/medicine.model');
const Setting = require('../models/setting.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

// Helper to create notifications
const triggerNotification = async (userId, title, message, type) => {
  try {
    await Notification.create({ userId, title, message, type, isRead: false });
  } catch (err) {
    console.error("Order Notification Trigger Failed:", err);
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const { patientId, pharmacistId, medicineId, quantity } = req.body;
    const medicine = await Medicine.findByPk(medicineId);
    
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });

    const patientFeeSetting = await Setting.findOne({ where: { key: 'fee_patient' } });
    const serviceFeePercent = patientFeeSetting ? parseFloat(patientFeeSetting.value) : 5;
    const markupSetting = await Setting.findOne({ where: { key: 'fee_pharmacist' } });
    const markupPercent = markupSetting ? parseFloat(markupSetting.value) : 10;

    const basePrice = parseFloat(medicine.price);
    const discountedBase = basePrice - (basePrice * (medicine.discount / 100));
    const priceWithMarkup = discountedBase + (discountedBase * (markupPercent / 100));
    
    const itemTotal = priceWithMarkup * quantity;
    const platformServiceFee = itemTotal * (serviceFeePercent / 100);
    const grandTotal = itemTotal + platformServiceFee;

    const status = medicine.requiresPrescription ? 'pending_verification' : 'pending';

    const order = await Order.create({
      patientId,
      pharmacistId,
      medicineId,
      quantity,
      totalPrice: grandTotal.toFixed(2),
      prescription_photo: req.file ? req.file.path : null,
      status
    });

    await triggerNotification(pharmacistId, "New Order Received 📦", `Order #${order.id}: ${medicine.name} (Qty: ${quantity}).`, "order");

    res.status(201).json({ message: "Order placed", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const order = await Order.findByPk(id, { include: [{ model: Medicine, as: 'medicine' }] });
    
    if (!order) return res.status(404).json({ message: "Order not found" });

    const oldStatus = order.status;
    order.status = status;
    if (rejectionReason) order.rejection_reason = rejectionReason;
    await order.save();

    if (status === 'pending' && oldStatus === 'pending_verification') {
      await triggerNotification(order.patientId, "Prescription Approved ✅", `Your Rx for ${order.medicine?.name} is verified.`, "order");
    } else if (status === 'rejected') {
      await triggerNotification(order.patientId, "Order Rejected ❌", `Reason: ${rejectionReason}`, "order");
    } else if (status === 'dispatched') {
      await triggerNotification(order.patientId, "Order Dispatched 🚚", `Your package for ${order.medicine?.name} is on the way!`, "order");
    } else if (status === 'delivered') {
      await triggerNotification(order.patientId, "Order Delivered 🎉", `Order #${order.id} has been delivered.`, "order");
    }

    res.json({ message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPharmacistOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { pharmacistId: req.params.pharmacistId },
      include: [
        { model: User, as: 'patient', attributes: ['name', 'address', 'contact_number'] }, // Ensure these patient fields are here
        { model: Medicine, as: 'medicine', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPatientOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { patientId: req.params.patientId },
      include: [
        { model: User, as: 'pharmacist', attributes: ['shop_name'] },
        { model: Medicine, as: 'medicine', attributes: ['name', 'medicine_photo'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};