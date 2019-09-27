const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reportUrl: String,
  reportStatus: {
    type: String,
    enum: ['notSubmitted', 'submitted', 'withExaminer', 'cleared'],
    default: 'notSubmitted'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date,
  receivedAt: Date, // date when examiner acknowledges receipt of the report
  clearedAt: Date,
  student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'student' }
});

ReportSchema.methods.isReviewDeadlineExceeded = function() {
  if (this.receivedAt && this.reportStatus === 'withExaminer') {
    return Math.abs((Date.now - this.submittedAt) / (1000 * 3600 * 24)) > 30;
  }

  return false;
};

module.exports = mongoose.model('report', ReportSchema);
