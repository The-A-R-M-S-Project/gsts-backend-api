const mongoose = require('mongoose');

const vivaSchema = new mongoose.Schema({
  vivaStatus: {
    type: String,
    enum: ['pending', 'done']
  },
  vivaScore: Number,
  vivaScoreDate: Date,
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'report' },
  vivaEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'event' } //includes the viva Date
});

module.exports = mongoose.model('viva', vivaSchema);
