const { db } = require('../config/firebase');

// POST /api/sos
const triggerSOS = async (req, res, next) => {
  try {
    const { type, location, lat, lng, assignedDoctorId } = req.body;
    const userId = req.user?.id || 'anonymous';
    
    const newAlert = { 
      userId, 
      type: type || 'Emergency', 
      location: location || 'Unknown', 
      lat: lat || 0, 
      lng: lng || 0, 
      assignedDoctorId: assignedDoctorId || null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('sosAlerts').add(newAlert);
    res.json({ success: true, message: 'Your Help request has been sent to a nearby doctor.', alertId: docRef.id });
  } catch (error) {
    next(error);
  }
};

// GET /api/sos/alerts
const getAllAlerts = async (req, res, next) => {
  try {
    let query = db.collection('sosAlerts').where('status', '==', 'ACTIVE');
    
    if (req.query.assignedDoctorId) {
       query = query.where('assignedDoctorId', '==', req.query.assignedDoctorId);
    }
    
    const snapshot = await query.get();
    
    const alerts = snapshot.docs.map(doc => {
      const a = doc.data();
      return {
        id: doc.id,
        userId: a.userId,
        type: a.type,
        location: a.location,
        lat: a.lat,
        lng: a.lng,
        assignedDoctorId: a.assignedDoctorId,
        status: a.status,
        timestamp: a.createdAt
      };
    });

    res.json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/sos/alerts/:id/resolve
const resolveAlert = async (req, res, next) => {
  try {
    const id = req.params.id;
    const alertRef = db.collection('sosAlerts').doc(id);
    const snap = await alertRef.get();

    if (!snap.exists) {
      return res.status(404).json({ success: false, error: 'Alert not found.' });
    }

    await alertRef.update({ 
      status: 'RESOLVED', 
      resolvedAt: new Date().toISOString() 
    });

    res.json({ success: true, message: 'Help request resolved.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { triggerSOS, getAllAlerts, resolveAlert };
