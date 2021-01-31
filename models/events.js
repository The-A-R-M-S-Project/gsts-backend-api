const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please tell us your first name!']
  },
  description: String,
  eventDate: Date,
  eventtype: {
    type: String,
    enum: ['global', 'viva'],
    default: 'global'
  }
});

module.exports = mongoose.model('event', EventSchema);
