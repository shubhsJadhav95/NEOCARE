const User = require('../models/user.model');
const Order = require('../models/order.model');
const Medicine = require('../models/medicine.model');
const Setting = require('../models/setting.model'); 
const Recommendation = require('../models/recommendation.model');
const Notification = require('../models/notification.model');
const { Op, fn, col, literal } = require('sequelize');
const nodemailer = require('nodemailer');
const db = require('../models/index'); // Strictly points to the index file for raw queries

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

exports.getOverview = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const doctors = await User.count({ where: { role: 'doctor', status: 'approved' } });
    const shops = await User.count({ where: { role: 'pharmacist', status: 'approved' } });
    const totalRevenue = await Order.sum('totalPrice', { where: { status: 'delivered' } }) || 0;
    const pendingUsers = await User.findAll({
      where: { role: { [Op.in]: ['doctor', 'pharmacist'] }, status: 'pending' },
      attributes: ['id', 'name', 'role', 'license_number', 'email', 'license_photo', 'degree_photo', 'shop_photo', 'registration_number']
    });
    res.json({ stats: { users: totalUsers, doctors, revenue: totalRevenue, shops }, pendingUsers });
  } catch (err) { res.status(500).json({ message: "Error", error: err.message }); }
};

exports.recommendMedicine = async (req, res) => {
  try {
    const { medicineName, reason, doctorId } = req.body;
    await Recommendation.create({ medicineName, reason, doctorId });
    res.json({ message: "Recommendation submitted successfully" });
  } catch (err) { res.status(500).json({ message: "Failed" }); }
};

exports.getRecommendationStats = async (req, res) => {
  try {
    const stats = await Recommendation.findAll({
      attributes: ['medicineName', [fn('COUNT', col('medicineName')), 'count']],
      group: ['medicineName'],
      order: [[literal('count'), 'DESC']],
      limit: 10
    });
    res.json(stats);
  } catch (err) { res.status(500).json({ message: "Failed" }); }
};

exports.pushToPharmacists = async (req, res) => {
  try {
    const { medicineName } = req.body;
    await Recommendation.update({ status: 'pushed' }, { where: { medicineName } });
    res.json({ message: "Pushed to pharmacists" });
  } catch (err) { res.status(500).json({ message: "Failed" }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status', 'createdAt', 'deletionWarnedAt', 'license_photo', 'degree_photo', 'shop_photo', 'registration_number', 'contact_number', 'emergency_contact_name', 'shop_name', 'specialist', 'license_number', 'reportedByName'],
      order: [
        [literal("CASE WHEN status = 'warned' THEN 1 ELSE 2 END"), 'ASC'],
        ['createdAt', 'DESC']
      ]
    });
    res.json(users);
  } catch (err) { res.status(500).json({ message: "Error" }); }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    const fees = {};
    settings.forEach(s => fees[s.key] = s.value);
    res.json(fees);
  } catch (err) { res.status(500).json({ message: "Error" }); }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await Setting.update({ value: value.toString() }, { where: { key } });
    }
    res.json({ message: "Settings Updated" });
  } catch (err) { res.status(500).json({ message: "Error" }); }
};

exports.verifyUser = async (req, res) => {
  const { userId, status } = req.body;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "Not found" });
    user.status = status; await user.save();
    if (status === 'approved') {
      try { await transporter.sendMail({ from: process.env.EMAIL_USER, to: user.email, subject: "Approved", html: `<h3>Approved!</h3>` }); } catch (e) {}
    }
    res.json({ message: "Success" });
  } catch (err) { res.status(500).json({ message: "Error" }); }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'patient', attributes: ['name'] },
        { model: User, as: 'pharmacist', attributes: ['name'] }, 
        { model: Medicine, as: 'medicine', attributes: ['name', 'price'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: "Error", error: err.message }); }
};

exports.warnUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ status: 'warned', deletionWarnedAt: new Date() });
    await Notification.create({
      userId,
      title: "Account Warning",
      message: `Your account has been flagged: ${message}. Deletion is possible after 24 hours.`,
      type: "alert"
    });
    res.json({ message: "Warning issued successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.restoreUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ 
      status: 'approved', 
      deletionWarnedAt: null,
      reportedByName: null
    });
    
    await Notification.create({
      userId,
      title: "Account Restored",
      message: "Your account warning has been cleared by the Administrator.",
      type: "appointment"
    });
    
    res.json({ message: "Account restored successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.reportDoctor = async (req, res) => {
  try {
    const { doctorId, doctorName, regNum, patientId, patientName } = req.body;

    // 1. STOP SPAM: Check if this specific patient already reported this doctor
    const [results] = await db.sequelize.query(
      `SELECT id FROM Reports WHERE doctorId = ? AND patientId = ? LIMIT 1`,
      { replacements: [doctorId, patientId] }
    );

    if (results.length > 0) {
      return res.status(403).json({ message: "Security Block: You have already reported this doctor." });
    }

    // 2. LOG THE REPORT IN DB
    await db.sequelize.query(
      `INSERT INTO Reports (doctorId, patientId) VALUES (?, ?)`,
      { replacements: [doctorId, patientId] }
    );
    
    // 3. STRICT UPDATE: Mark as warned and save reporter name
    await User.update(
        { 
          status: 'warned', 
          deletionWarnedAt: new Date(),
          reportedByName: patientName 
        }, 
        { where: { id: doctorId } }
    );

    // 4. NOTIFY ADMINS
    const admins = await User.findAll({ where: { role: 'admin' } });
    for (const admin of admins) {
      await Notification.create({
        userId: admin.id,
        title: "🚨 URGENT: Doctor Fraud Report",
        message: `Dr. ${doctorName} was reported by Patient: ${patientName}.`,
        type: "alert"
      });
    }

    res.json({ message: "Fraud report processed." });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

exports.deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user.deletionWarnedAt) return res.status(400).json({ message: "Warn user first" });
    const hoursPassed = (new Date() - new Date(user.deletionWarnedAt)) / (1000 * 60 * 60);
    if (hoursPassed < 24) return res.status(403).json({ message: "Must wait 24 hours" });
    await user.destroy();
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getPushedCount = async (req, res) => {
  try {
    const count = await Recommendation.count({ where: { status: 'pushed' } });
    res.json({ count });
  } catch (err) { res.status(500).json({ message: "Error" }); }
};

exports.getPushedMedicines = async (req, res) => {
  try {
    const pushed = await Recommendation.findAll({
      where: { status: 'pushed' },
      attributes: ['medicineName', 'reason', 'createdAt'],
      group: ['medicineName'], 
      order: [['createdAt', 'DESC']]
    });
    res.json(pushed);
  } catch (err) { res.status(500).json({ message: "Error" }); }
};

exports.markRecommendationHandled = async (req, res) => {
  try {
    const { medicineName } = req.body;
    await Recommendation.update({ status: 'handled' }, { where: { medicineName, status: 'pushed' } });
    res.json({ message: "Handled" });
  } catch (err) { res.status(500).json({ message: "Error" }); }
};