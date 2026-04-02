const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: false }, 
  password: { type: String, required: true },
  ageGroup: { type: String, default: 'teens' },
  role: { type: String, default: 'user', enum: ['user', 'doctor', 'volunteer', 'admin'] },
  token: { type: String },
  // Registration Expansions
  fullName: { type: String },
  phone: { type: String },
  gender: { type: String },
  city: { type: String },
  // Gamification Engine
  points: { type: Number, default: 0 },
  streakCount: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  level: { type: Number, default: 1 },
  badges: { type: [String], default: [] },
  communities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
