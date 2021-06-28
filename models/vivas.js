const mongoose = require('mongoose');
const validator = require('validator');

const vivaSchema = new mongoose.Schema({
  vivaStatus: {
    type: String,
    enum: ['pending', 'done'],
    default: 'pending'
  },
  vivaScore: Number,
  vivaGrade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E', 'E-', 'F']
  },
  vivaScoreDate: Date,
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'report' },
  vivaEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'event' },
  vivaCommittee: [
    {
      name: String,
      phone: {
        type: String,
        validate: {
          validator: function(number) {
            return validator.isMobilePhone(number, 'en-UG');
          },
          message: 'Please enter a valid Phone Number (en-UG)'
        }
      },
      email: {
        type: String,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
      },
      affiliation: String
    }
  ]
});

module.exports = mongoose.model('viva', vivaSchema);
