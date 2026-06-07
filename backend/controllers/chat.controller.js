const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const { Op } = require('sequelize');

exports.getActiveContacts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query; 
    const today = new Date();

    // Logic: Approved follow-ups where the expiry date hasn't passed
    const activeAppointments = await Appointment.findAll({
      where: {
        [role === 'patient' ? 'patientId' : 'doctorId']: userId,
        // Active during confirmed or completed status if follow-up is set
        status: { [Op.in]: ['confirmed', 'completed'] },
        isFollowUp: true,
        followUpExpiry: { [Op.gte]: today }
      },
      include: [{
        model: User,
        as: role === 'patient' ? 'doctor' : 'patient',
        attributes: ['id', 'name', 'profile_photo', 'role']
      }]
    });

    const uniqueContacts = Array.from(new Map(activeAppointments.map(app => {
      const contact = role === 'patient' ? app.doctor : app.patient;
      if (!contact) return null;
      return [contact.id, contact];
    }).filter(Boolean)).values());

    res.json(uniqueContacts);
  } catch (err) {
    console.error("Chat Contact Error:", err);
    res.status(500).json({ message: "Database Error: Ensure followUpExpiry exists." });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { userId, otherId } = req.params;
    const messages = await Chat.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId }
        ]
      },
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};