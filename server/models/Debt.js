const mongoose = require('mongoose');
module.exports = mongoose.model('Debt', new mongoose.Schema({
  memberId: String, desc: String, amount: Number, paid: { type: Number, default: 0 },
  status: { type: String, enum: ['outstanding', 'partial', 'paid', 'waived'], default: 'outstanding' },
  payments: [{ amount: Number, date: Date, by: String, roleAtTime: String }],
  createdBy: String, createdByRoleAtTime: String, date: String
}));