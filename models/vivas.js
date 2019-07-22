const mongoose = require('mongoose');

const vivaSchema = new mongoose.Schema({
  vivaStatus: {
    type: String,
    enum: ['pending', 'done']
  },
  vivaScore: Number,
  vivaDate: Date
});

module.exports = mongoose.model('viva', vivaSchema);
