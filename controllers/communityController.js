const { db } = require('../config/firebase');

const SEED_COMMUNITIES = [
  { name: 'Mental Health Matters', slug: 'mhm', description: 'Official NGO circle for holistic mental well-being.', icon: '🧠', color: '#7c3aed' },
  { name: 'Student Stress Relief', slug: 'student-stress', description: 'Exam pressure, academic goals, and peer support.', icon: '📚', color: '#3b82f6' },
  { name: 'Anxiety Support Group', slug: 'anxiety-support', description: 'A safe space to manage panic and social anxiety.', icon: '🌊', color: '#10b981' },
  { name: 'Depression Fighters', slug: 'depression-fighters', description: 'Official support network for clinical depression recovery.', icon: '☀️', color: '#f59e0b' },
  { name: 'Mindfulness & Yoga', slug: 'mind-zen', description: 'Daily practices for staying grounded and centered.', icon: '🧘‍♀️', color: '#10b981' },
  { name: 'Brave Souls (Trauma Recovery)', slug: 'trauma', description: 'Healing together from past experiences.', icon: '🛡️', color: '#ef4444' },
  { name: 'Career Care Hub', slug: 'career', description: 'Work-life balance and corporate stress management.', icon: '💼', color: '#6366f1' },
  { name: 'Safe Haven (LGBTQ+)', slug: 'safe-haven', description: 'Inclusive support for the rainbow community.', icon: '🌈', color: '#ec4899' },
  { name: 'Youth Empowerment', slug: 'youth', description: 'Mentorship and leadership for the next generation.', icon: '🚀', color: '#f97316' },
  { name: 'Caregiver Circle', slug: 'caregivers', description: 'Support for those who support others.', icon: '🫂', color: '#14b8a6' },
];

const seedCommunities = async () => {
    try {
        for (const c of SEED_COMMUNITIES) {
            await db.collection('communities').doc(c.slug).set({ ...c, memberCount: 0 }, { merge: true });
        }
    } catch (err) { console.warn('Seeding failed:', err.message); }
};
seedCommunities();

// POST /api/community/join/:id
const joinCommunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRef = db.collection('users').doc(req.user.id);
    const userSnap = await userRef.get();

    if (!userSnap.exists) return res.status(404).json({ success: false, error: 'User not found.' });
    const user = userSnap.data();

    const communities = user.communities || [];
    if (communities.includes(id)) {
      return res.status(400).json({ success: false, error: 'Already registered.' });
    }

    if (communities.length >= 10) {
      return res.status(400).json({ success: false, error: 'Community limit reached.' });
    }

    communities.push(id);
    await userRef.update({ 
        communities, 
        points: (user.points || 0) + 50 
    });

    // Update member count
    const commRef = db.collection('communities').doc(id);
    const commSnap = await commRef.get();
    if (commSnap.exists) {
        await commRef.update({ memberCount: (commSnap.data().memberCount || 0) + 1 });
    }

    res.json({ success: true, message: 'Welcome to the circle! (+50 Points)', communities });
  } catch (error) { next(error); }
};

// GET /api/community/me
const getMyCommunities = async (req, res, next) => {
  try {
    const userSnap = await db.collection('users').doc(req.user.id).get();
    const user = userSnap.data();
    const communityIds = user.communities || [];
    
    if (communityIds.length === 0) return res.json({ success: true, communities: [] });

    // Manual population
    const comms = [];
    for (const cid of communityIds) {
        const snap = await db.collection('communities').doc(cid).get();
        if (snap.exists) comms.push({ id: snap.id, ...snap.data() });
    }
    
    res.json({ success: true, communities: comms });
  } catch (error) { next(error); }
};

// POST /api/community/posts
const createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    const user = req.user;

    if (!title || !content) return res.status(400).json({ success: false, error: 'Title and content required.' });

    const newPost = {
      authorId: user.id,
      authorName: user.username,
      title,
      content,
      category: category || 'General',
      upvotes: 0,
      meTooCount: 0,
      answers: [],
      isResolved: false,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('mentorPosts').add(newPost);
    res.status(201).json({ success: true, post: { ...newPost, id: docRef.id } });
  } catch (error) { next(error); }
};

// GET /api/community/posts
const getPosts = async (req, res, next) => {
  try {
    const { category, community } = req.query;
    let query = db.collection('mentorPosts');

    if (category && category !== 'All') {
        query = query.where('category', '==', category);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(30).get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.json({ success: true, posts });
  } catch (error) {
    console.warn('Get Posts Error (Likely Index or Empty):', error.message);
    res.json({ success: true, posts: [] });
  }
};

// POST /api/community/posts/:id/hug
const addHug = async (req, res, next) => {
  try {
    const postRef = db.collection('mentorPosts').doc(req.params.id);
    const snap = await postRef.get();
    if (!snap.exists) return res.json({ success: false });
    
    const newVal = (snap.data().upvotes || 0) + 1;
    await postRef.update({ upvotes: newVal });
    res.json({ success: true, upvotes: newVal });
  } catch (e) { next(e); }
};

// POST /api/community/posts/:id/metoo
const addMeToo = async (req, res, next) => {
  try {
    const postRef = db.collection('mentorPosts').doc(req.params.id);
    const snap = await postRef.get();
    if (!snap.exists) return res.json({ success: false });
    
    const newVal = (snap.data().meTooCount || 0) + 1;
    await postRef.update({ meTooCount: newVal });
    res.json({ success: true, meTooCount: newVal });
  } catch (e) { next(e); }
};

// POST /api/community/posts/:id/answers
const answerPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const user = req.user;

    if (user.role !== 'doctor' && user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Guides only.' });
    }

    const postRef = db.collection('mentorPosts').doc(id);
    const snap = await postRef.get();
    if (!snap.exists) return res.status(404).json({ success: false, error: 'Not found.' });

    const post = snap.data();
    const answers = post.answers || [];
    answers.push({ mentorId: user.id, mentorName: user.username, text, timestamp: new Date().toISOString() });
    
    await postRef.update({ answers, isResolved: true });
    res.json({ success: true, message: 'Expert guidance posted.', answers });
  } catch (error) { next(error); }
};

// GET /api/community/spaces
const getCommunities = async (req, res, next) => {
  try {
    const snapshot = await db.collection('communities').orderBy('name', 'asc').get();
    const communities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, communities: communities.length ? communities : SEED_COMMUNITIES });
  } catch (error) { res.json({ success: true, communities: SEED_COMMUNITIES }); }
};

module.exports = { createPost, getPosts, answerPost, addHug, addMeToo, getCommunities, joinCommunity, getMyCommunities };
