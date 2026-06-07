const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');

// ISSUING & FETCHING ROUTES
router.post('/create', prescriptionController.createPrescription);
router.get('/patient/:patientId', prescriptionController.getPatientPrescriptions);

// --- NEW: Nutri-Care Context Engine Route ---
// Logic: Fetches the latest Diet Tags and Clinical Warnings for the Recipe Finder
router.get('/dietary-context/:patientId', prescriptionController.getPatientDietaryContext);

module.exports = router;