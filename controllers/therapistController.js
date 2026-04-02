const { db } = require('../config/firebase');

const MOCK_THERAPISTS = [
    { name: 'Dr. Priya Sharma', specialization: 'Child & Adolescent Psychology', tags: ['Teens', 'Anxiety', 'CBT'], rating: 4.9, reviews: 127, avatar: '👩‍⚕️' },
    { name: 'Dr. Arjun Mehta', specialization: 'Cognitive Behavioral Therapy', tags: ['Depression', 'Stress', 'DBT'], rating: 4.8, reviews: 94, avatar: '👨‍⚕️' },
    { name: 'Dr. Meera Nair', specialization: 'Trauma & Family Therapy', tags: ['Trauma', 'Family', 'Hindi'], rating: 4.9, reviews: 203, avatar: '👩‍⚕️' }
];

// GET /api/therapists
const getTherapists = async (req, res, next) => {
  try {
    let snapshot = await db.collection('therapists').get();
    let therapists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (therapists.length === 0) therapists = MOCK_THERAPISTS;

    const { tag, search } = req.query;
    if (tag) {
        therapists = therapists.filter(t => t.tags.some(tg => tg.toLowerCase().includes(tag.toLowerCase())));
    }
    if (search) {
        const s = search.toLowerCase();
        therapists = therapists.filter(t => t.name.toLowerCase().includes(s) || t.specialization.toLowerCase().includes(s));
    }

    res.json({ success: true, count: therapists.length, therapists });
  } catch (error) {
    next(error);
  }
};

// GET /api/therapists/:id
const getTherapistById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const snap = await db.collection('therapists').doc(id).get();
    
    if (!snap.exists) {
        // Check if it's a mock ID pattern or fallback
        const mock = MOCK_THERAPISTS.find(t => t.name.includes(id));
        return res.json({ success: true, therapist: mock || MOCK_THERAPISTS[0] });
    }
    
    res.json({ success: true, therapist: { id: snap.id, ...snap.data() } });
  } catch (error) {
    next(error);
  }
};

// POST /api/therapists/:id/book
const bookSession = async (req, res, next) => {
  try {
    const therapistId = req.params.id;
    const { preferredDate, preferredTime } = req.body;
    const userId = req.user?.id || 'anonymous';
    
    const therapistSnap = await db.collection('therapists').doc(therapistId).get();
    const therapistName = therapistSnap.exists ? therapistSnap.data().name : 'Dr. Specialized';

    const newBooking = {
      userId, therapistId, therapistName, preferredDate: preferredDate || 'TBD', preferredTime: preferredTime || 'TBD', status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('bookings').add(newBooking);
    res.status(201).json({ success: true, message: `Booking request sent to ${therapistName}.`, bookingId: docRef.id });
  } catch (error) {
    next(error);
  }
};

// GET /api/therapists/me/stats
const getDoctorStats = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const bookingsSnap = await db.collection('bookings').where('therapistId', '==', doctorId).get();
    
    const patientIds = new Set();
    bookingsSnap.docs.forEach(doc => patientIds.add(doc.data().userId));

    // Sessions today
    const today = new Date().toISOString().split('T')[0];
    const sessionsToday = bookingsSnap.docs.filter(doc => doc.data().preferredDate === today).length;

    res.json({
      success: true,
      stats: { assignedPatients: patientIds.size, sessionsToday, urgentAlerts: 1 }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/therapists/me/patients
const getMyPatients = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const bookingsSnap = await db.collection('bookings').where('therapistId', '==', doctorId).get();
    
    const patients = [];
    for (const doc of bookingsSnap.docs) {
        const b = doc.data();
        const userSnap = await db.collection('users').doc(b.userId).get();
        const u = userSnap.data() || {};
        patients.push({
            _id: b.userId,
            username: u.username || 'Anonymous User',
            age: u.ageGroup || 'teens',
            focus: b.sessionType || 'General Consultation',
            lastSession: b.preferredDate
        });
    }

    res.json({ success: true, patients: patients.length ? patients : [
        { _id: 'p1', username: 'Aarav', age: '15', focus: 'Stress Mgmt', lastSession: '2026-03-31' }
    ] });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTherapists, getTherapistById, bookSession, getDoctorStats, getMyPatients };
