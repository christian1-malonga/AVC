const mongoose = require('mongoose');
// SECRET BALLOT: we store ONLY anonymous tallies + a separate list of WHO voted.

module.exports = mongoose.model('Election', new mongoose.Schema({
  post: String, candidateIds: [String],
  status: { type: String, enum: ['draft', 'live', 'closed'], default: 'draft' },
  tally: { type: Map, of: Number },
  votedIds: [String],
  startsAt: Date, endsAt: Date,
  resultsPublished: { type: Boolean, default: false },
  created: { type: Date, default: Date.now }
}));