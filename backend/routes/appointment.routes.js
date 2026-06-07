const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');

// 1. Booking
router.post('/book', appointmentController.bookAppointment);

// 2. Doctor side (fetching)
router.get('/doctor/:doctorId', appointmentController.getDoctorAppointments);

// 3. Patient side (fetching)
router.get('/patient/:patientId', appointmentController.getPatientAppointments);

// 4. Update status
router.put('/update/:id', appointmentController.updateStatus);

module.exports = router;