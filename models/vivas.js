const mongoose = require('mongoose');
const validator = require('validator');

const vivaSchema = new mongoose.Schema({
  vivaStatus: {
    type: String,
    enum: ['pending', 'done'],
    default: 'pending'
  },
  vivaScore: Number,
  vivaScoreDate: Date,
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'report' },
  vivaEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'event' },
  vivaCommittee: [
    {
      name: String,
      email: {
        type: String,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
      },
      affiliation: String
    }
  ]
});

module.exports = mongoose.model('viva', vivaSchema);
