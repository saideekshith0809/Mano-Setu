const mongoose = require('mongoose');

const mentorPostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true }, // Anonymous nickname
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['General', 'Exam Stress', 'Self Care', 'Social', 'Joy'], default: 'General' },
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  upvotes: { type: Number, default: 0 },
  meTooCount: { type: Number, default: 0 },
  isResolved: { type: Boolean, default: false },
  answers: [{
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mentorName: { type: String },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('MentorPost', mentorPostSchema);
