const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String
  },
  description: String,
  eventDate: Date,
  eventType: {
    type: String,
    enum: ['global', 'viva'],
    default: 'global'
  }
});

module.exports = mongoose.model('event', EventSchema);
