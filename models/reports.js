const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reportUrl: String,
  reportStatus: {
    type: String,
    enum: ['submitted', 'With examiner', 'cleared'],
    default: 'submitted'
  },
  dateSubmitted: {
    type: Date,
    default: Date.now
  },
  dateWithExaminer: Date,
  dateCleared: Date,
  student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'student' }
});

ReportSchema.methods.isReviewDeadlineExceeded = function() {
  if (this.dateWithExaminer && this.reportStatus === 'With examiner') {
    return Math.abs((Date.now - this.dateSubmmited) / (1000 * 3600 * 24)) > 30;
  }

  return false;
};

module.exports = mongoose.model('report', ReportSchema);
