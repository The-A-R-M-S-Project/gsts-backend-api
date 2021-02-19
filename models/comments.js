const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'report' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'student' },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'staff' }
});

module.exports = mongoose.model('comment', CommentSchema);
