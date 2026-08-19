const mongoose = require('mongoose');
module.exports = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  passwordHash: { type: String, required: true },
  googleId: String,
  avatar: String,
  roles: { type: [String], default: ['member'] },
  section: { type: String, default: null },
  status: { type: String, enum: ['active', 'pending', 'deactivated'], default: 'active' },
  joined: { type: Date, default: Date.now }
}));