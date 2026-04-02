/**
 * ManoSetu - Dashboard Controller (Mongoose)
 */

const { db } = require('../config/firebase');

// GET /api/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    // Race queries against a 2s timeout to prevent frontend hangs
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
    
    try {
        const [usersSnap, sosSnap, pendingSnap, msgSnap, moodSnap] = await Promise.race([
            Promise.all([
                db.collection('users').where('role', '==', 'user').count().get(),
                db.collection('sosAlerts').where('status', '==', 'ACTIVE').count().get(),
                db.collection('sosAlerts').where('status', '==', 'PENDING').count().get(),
                db.collection('messages').count().get(),
                db.collection('moodLogs').count().get()
            ]),
            timeout
        ]);

        const totalUsers = usersSnap.data().count;
        const activeSOS = sosSnap.data().count;
        const pendingAlerts = pendingSnap.data().count;
        const totalMessages = msgSnap.data().count;
        const totalMoodLogs = moodSnap.data().count;

        // Community Stats
        const usersCol = await db.collection('users').get();
        let totalRegistrations = 0;
        usersCol.docs.forEach(doc => {
            const u = doc.data();
            if (u.communities && Array.isArray(u.communities)) totalRegistrations += u.communities.length;
        });

        const topCirclesSnap = await db.collection('communities').orderBy('memberCount', 'desc').limit(3).get();
        const topCircles = topCirclesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
        // Calculate Wellbeing Index (1-100)
        let averageScore = 0;
        try {
          const moodsSnap = await db.collection('moodLogs').limit(500).get();
          let totalScore = 0;
          moodsSnap.docs.forEach(doc => {
            const m = doc.data();
            if (m.mood === 'HAPPY') totalScore += 100;
            else if (m.mood === 'CALM') totalScore += 75;
            else if (m.mood === 'ANXIOUS') totalScore += 40;
            else if (m.mood === 'SAD') totalScore += 20;
          });
          averageScore = moodsSnap.size > 0 ? Math.round(totalScore / moodsSnap.size) : 0;
        } catch (err) { console.warn('Could not calc wellbeing.'); }

        // Calculate Active Regions (Unique Cities)
        const cities = new Set();
        usersCol.docs.forEach(doc => {
            const city = doc.data().city;
            if (city && city.trim() !== '') cities.add(city.trim());
        });
        const activeRegions = cities.size;

        res.json({
          success: true,
          stats: { 
            totalUsers, activeSOS, pendingAlerts, totalMessages, totalMoodLogs, totalRegistrations,
            activeUsers: totalUsers,
            averageWellbeingScore: averageScore || 0,
            activeRegions: activeRegions || 0,
            systemHealth: `Active (${averageScore || 0})`
          },
          topCircles: topCircles || [],
          recentAlerts: [] // Can be populated later
        });
    } catch (dbErr) {
        console.error('⚠️ DB Error/Timeout in Dashboard:', dbErr.message);
        // Fallback to offline-style response instead of 500
        return res.json({
            success: true,
            stats: { 
              totalUsers: 0, totalSosAlerts: 0, totalMoodLogs: 0, totalRegistrations: 0,
              activeUsers: 0, averageWellbeingScore: 0, highRisk: 0, watchList: 0, 
              activeSOS: 0, pendingAlerts: 0, totalMessages: 0, aiAccuracy: '100%',
              systemHealth: 'Syncing...', loadTrend: [0, 0, 0, 0, 0, 0, 0]
            },
            moodDistribution: { HAPPY: 0, CALM: 0, ANXIOUS: 0, SAD: 0 },
            weeklyTrend: [],
            recentAlerts: []
        });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
