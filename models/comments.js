const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  reportID: { type: mongoose.Schema.Types.ObjectId, ref: 'report' },
  studentID: { type: mongoose.Schema.Types.ObjectId, ref: 'student' },
  staffID: { type: mongoose.Schema.Types.ObjectId, ref: 'staff' }
});

module.exports = mongoose.model('event', CommentSchema);
