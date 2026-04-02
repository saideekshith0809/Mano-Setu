const { db } = require('../config/firebase');

const protect = async (req, res, next) => {
  try {
    const token = req.headers['x-session-token'];

    if (!token) {
      // Allow anonymous context
      req.user = { id: 'anonymous', ageGroup: 'teens' };
      return next();
    }

    const snapshot = await db.collection('users').where('token', '==', token).get();

    if (snapshot.empty) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session token.' });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    req.user = { id: userDoc.id, username: user.username, ageGroup: user.ageGroup, role: user.role };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, error: 'Authentication failed.' });
  }
};

module.exports = { protect };
