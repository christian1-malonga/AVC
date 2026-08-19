const mongoose = require('mongoose');
module.exports = mongoose.model('Session', new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User', index: true },
  userAgent: String, ip: String, expiresAt: Date, createdAt: { type: Date, default: Date.now }
}));