const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String, default: '🌐' },
  color: { type: String, default: '#7c3aed' },
  memberCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Community', communitySchema);
