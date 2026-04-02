const { db } = require('../config/firebase');

// POST /api/mood
const logMood = async (req, res, next) => {
  try {
    const { mood, notes } = req.body;

    if (!mood) {
      return res.status(400).json({ success: false, error: 'Mood is required.' });
    }

    const userId = req.user && req.user.id ? req.user.id : 'anonymous';
    const newLog = {
      userId, mood, notes: notes ? String(notes).slice(0, 500) : '',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('moodLogs').add(newLog);

    let gamiData = null;
    if (userId !== 'anonymous') {
      const userRef = db.collection('users').doc(userId);
      const userSnap = await userRef.get();
      
      if (userSnap.exists) {
        const user = userSnap.data();
        let earnedPoints = 10;
        if (notes && notes.length > 5) earnedPoints += 15;
        
        const newPoints = (user.points || 0) + earnedPoints;
        const newStreak = (user.streakCount || 0) + 1;
        
        await userRef.update({
          points: newPoints,
          streakCount: newStreak,
          lastActiveDate: new Date().toISOString()
        });
        
        gamiData = { 
          points: newPoints, 
          streak: newStreak, 
          level: Math.floor(newPoints/100)+1, 
          earnedPoints 
        };
      }
    }

    res.status(201).json({ success: true, message: 'Mood logged successfully.', entryId: docRef.id, gamification: gamiData });
  } catch (error) {
    next(error);
  }
};

// GET /api/mood/history
const getMoodHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'anonymous';
    const snapshot = await db.collection('moodLogs')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();

    const logs = snapshot.docs.map(doc => {
      const d = doc.data();
      return { id: doc.id, mood: d.mood, notes: d.notes, timestamp: d.createdAt };
    });
    
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    // Standard Firestore error handling if indexing is missing
    console.warn('Mood History Error (Likely Index or Empty):', error.message);
    res.json({ success: true, count: 0, logs: [] });
  }
};

// GET /api/mood/streak
const getMoodStreak = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'anonymous';
    if (userId === 'anonymous') return res.json({ success: true, streak: 0 });

    const userSnap = await db.collection('users').doc(userId).get();
    const streak = userSnap.exists ? (userSnap.data().streakCount || 0) : 0;
    
    res.json({ success: true, streak });
  } catch (error) {
    next(error);
  }
};

module.exports = { logMood, getMoodHistory, getMoodStreak };

module.exports = { logMood, getMoodHistory, getMoodStreak };
