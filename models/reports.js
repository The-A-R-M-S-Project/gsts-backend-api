const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reportUrl: String,
  reportStatus: {
    type: String,
    enum: ['submitted', 'With examiner', 'cleared']
  },
  dateSubmitted: {
    type: Date,
    default: Date.now
  },
  dateWithExaminer: Date,
  dateCleared: Date
});

ReportSchema.methods.isReviewDeadlineExceeded = function() {
  if (this.dateWithExaminer && this.reportStatus === 'With examiner') {
    return Math.abs((Date.now - this.dateSubmmited) / (1000 * 3600 * 24)) > 30;
  }

  return false;
};

module.exports = mongoose.model('report', ReportSchema);
