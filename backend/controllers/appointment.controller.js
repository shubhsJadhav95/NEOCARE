const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

const triggerNotification = async (userId, title, message, type) => {
  try {
    await Notification.create({ userId, title, message, type, isRead: false });
  } catch (err) { console.error("Notif Error:", err); }
};

exports.bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, billingType } = req.body;
    
    // Logic: Default to per_visit if billingType is missing
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      billingType: billingType || 'per_visit',
      status: 'pending',
      treatmentType: 'offline'
    });

    const patient = await User.findByPk(patientId);
    await triggerNotification(
      doctorId,
      "New Appointment Request",
      `${patient?.name || 'A patient'} has requested an appointment for ${date} at ${time}.`,
      "appointment"
    );
    res.status(201).json(appointment);
  } catch (err) { 
    console.error("Booking Logic Error:", err);
    res.status(500).json({ message: err.message }); 
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { doctorId: req.params.doctorId },
      include: [{ model: User, as: 'patient', attributes: ['name', 'email', 'profile_photo'] }]
    });
    res.json(appointments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { patientId: req.params.patientId },
      include: [{ model: User, as: 'doctor', attributes: ['name', 'specialist', 'profile_photo'] }]
    });
    res.json(appointments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, nextFollowUpDate, isFollowUp } = req.body;
    
    const appointment = await Appointment.findByPk(id, {
      include: [{ model: User, as: 'doctor', attributes: ['name'] }]
    });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = status;
    if (nextFollowUpDate) appointment.nextFollowUpDate = nextFollowUpDate;
    if (isFollowUp !== undefined) appointment.isFollowUp = isFollowUp;

    // LOGIC: Automatically set followUpExpiry when treatment is completed
    if (status === 'completed' && isFollowUp && nextFollowUpDate) {
      const expiryDate = new Date(nextFollowUpDate);
      expiryDate.setDate(expiryDate.getDate() + 7); // Active for 7 days post follow-up
      appointment.followUpExpiry = expiryDate;
    }
    
    await appointment.save();

    const title = status === 'confirmed' ? "Appointment Confirmed ✅" : status === 'completed' ? "Treatment Completed 🏥" : "Appointment Cancelled ❌";
    const msg = status === 'confirmed' 
      ? `Dr. ${appointment.doctor?.name} confirmed your visit for ${appointment.date}.`
      : `Status updated to ${status} by Dr. ${appointment.doctor?.name}.`;

    await triggerNotification(appointment.patientId, title, msg, "appointment");
    res.status(200).json({ message: `Updated to ${status}`, appointment });
  } catch (err) { res.status(500).json({ message: err.message }); }
};