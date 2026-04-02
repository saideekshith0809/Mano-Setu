/**
 * ManoSetu - Community Routes
 */

const express = require('express');
const router = express.Router();
const { createPost, getPosts, answerPost, addHug, addMeToo, getCommunities, joinCommunity, getMyCommunities } = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

router.get('/spaces', getCommunities);
router.get('/me', protect, getMyCommunities);
router.post('/join/:id', protect, joinCommunity);
router.post('/posts', protect, createPost);
router.get('/posts', getPosts);
router.post('/posts/:id/answers', protect, answerPost);
router.post('/posts/:id/hug', protect, addHug);
router.post('/posts/:id/metoo', protect, addMeToo);

module.exports = router;
