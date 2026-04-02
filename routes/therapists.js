const express = require('express');
const router = express.Router();
const { getTherapists, getTherapistById, bookSession } = require('../controllers/therapistController');
const { protect } = require('../middleware/auth');

// GET /api/therapists - List all therapists (supports ?tag= and ?search= query params)
router.get('/', getTherapists);

// GET /api/therapists/:id - Get a single therapist
router.get('/:id', getTherapistById);

// POST /api/therapists/:id/book - Book a session
router.post('/:id/book', protect, bookSession);

// Doctor Dashboard Endpoints
const { getDoctorStats, getMyPatients } = require('../controllers/therapistController');
router.get('/me/stats', protect, getDoctorStats);
router.get('/me/patients', protect, getMyPatients);

module.exports = router;
