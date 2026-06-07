const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const nodemailer = require('nodemailer');

// Setup Transporter using your .env credentials
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.params.userId },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    res.json(notifications);
  } catch (err) { res.status(500).json({ message: "Error" }); }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.params.userId } });
    res.json({ message: "Marked as read" });
  } catch (err) { res.status(500).json({ message: "Error" }); }
};

exports.createNotification = async (userId, title, message, type) => {
  try {
    await Notification.create({ userId, title, message, type });
  } catch (err) { console.error("Notification failed", err); }
};

// NEW: SOS Emergency Dispatch Logic
exports.triggerEmergencyAlert = async (req, res) => {
  try {
    const { userId, location } = req.body;
    const user = await User.findByPk(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Create Internal Alert Notification
    await Notification.create({
      userId,
      title: "🚨 SOS ALERT TRIGGERED",
      message: `Emergency services and contacts alerted. Location: ${location}`,
      type: "emergency"
    });

    // 2. Send Email to Emergency Contact
    if (user.emergency_contact_email) {
      const mailOptions = {
        from: `"NeoCare Emergency Service" <${process.env.EMAIL_USER}>`,
        to: user.emergency_contact_email,
        subject: `🚨 URGENT: Emergency SOS from ${user.name}`,
        html: `
          <div style="font-family: sans-serif; border: 3px solid red; padding: 20px;">
            <h1 style="color: red;">Emergency Alert</h1>
            <p><strong>${user.name}</strong> has triggered an SOS signal on the NeoCare Platform.</p>
            <p><strong>Live Location:</strong> <a href="${location}">Click to View Map</a></p>
            <p><strong>Patient Contact:</strong> ${user.contact_number}</p>
            <p style="background: #fff5f5; padding: 10px; border-radius: 8px; font-weight: bold; color: #d32f2f;">
               Please check on them immediately.
            </p>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
    }
    res.json({ message: "Alerts Dispatched" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};