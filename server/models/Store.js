const mongoose = require('mongoose');
module.exports = mongoose.model('Store', new mongoose.Schema({
  key: { type: String, unique: true },
  data: mongoose.Schema.Types.Mixed
}));