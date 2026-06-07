const CreditRequest = require('../models/creditRequest.model');
const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const { Op } = require('sequelize');

exports.createRequest = async (req, res) => {
  try {
    const { userId, amount, type, transactionId, upiId } = req.body;
    const screenshot = req.file ? req.file.path : null;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    if (type === 'withdraw') {
      const user = await User.findByPk(userId);
      if (user.credits < amount) return res.status(400).json({ message: "Insufficient credits" });
      await user.decrement('credits', { by: amount });
    }

    const request = await CreditRequest.create({
      userId, type, amount, transactionId, screenshot, upiId, expiresAt, status: 'pending'
    });
    res.status(201).json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getUserRequests = async (req, res) => {
  try {
    const requests = await CreditRequest.findAll({ where: { userId: req.params.userId } });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllRequests = async (req, res) => {
  try {
    const { type } = req.query;
    const requests = await CreditRequest.findAll({
      where: { type },
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.approveRequest = async (req, res) => {
  try {
    const request = await CreditRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });
    const user = await User.findByPk(request.userId);
    if (request.type === 'buy') await user.increment('credits', { by: request.amount });
    await request.update({ status: 'approved' });
    res.json({ message: "Approved" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getFinanceStats = async (req, res) => {
  try {
    const totalIssued = await CreditRequest.sum('amount', { where: { type: 'buy', status: 'approved' } }) || 0;
    const totalRedeemed = await CreditRequest.sum('amount', { where: { type: 'withdraw', status: 'approved' } }) || 0;
    const totalPenalty = await CreditRequest.sum('penaltyAmount') || 0;
    const pendingCount = await CreditRequest.count({ where: { status: 'pending' } });
    res.json({ totalIssued, totalRedeemed, totalPenalty, pendingCount });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.payDoctor = async (req, res) => {
  try {
    const { patientId, doctorId, amount, appointmentId } = req.body;
    const patient = await User.findByPk(patientId);
    const doctor = await User.findByPk(doctorId);
    if (patient.credits < amount) return res.status(400).json({ message: "Insufficient credits." });
    await patient.decrement('credits', { by: amount });
    await doctor.increment('credits', { by: amount });
    await Appointment.update({ billingType: 'paid_via_credits' }, { where: { id: appointmentId } });
    res.json({ message: "Payment successful!" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// NEW: Checkout Deduction Logic
exports.deductCheckout = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await User.findByPk(userId);
    if (user.credits < amount) return res.status(400).json({ message: "Insufficient credits for checkout." });
    await user.decrement('credits', { by: amount });
    res.json({ message: "Credits deducted successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};