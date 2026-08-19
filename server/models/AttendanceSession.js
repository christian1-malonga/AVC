const mongoose = require('mongoose');
module.exports = mongoose.model('AttendanceSession', new mongoose.Schema({
  title: String, date: String, type: { type: String, enum: ['rehearsal', 'service', 'event'], default: 'service' },
  qrToken: String, qrExpires: Date,
  records: { type: Map, of: String },
  checkins: [{ userId: String, time: Date, method: { type: String, enum: ['qr', 'manual'] } }],
  markedBy: String, markedByRoleAtTime: String
}));