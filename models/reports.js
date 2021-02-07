const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  title: String,
  abstract: String,
  status: {
    type: String,
    enum: [
      'notSubmitted',
      'submitted',
      'withExaminer',
      'clearedByExaminer',
      'vivaDateSet',
      'vivaComplete',
      'pendingRevision',
      'complete'
    ],
    default: 'notSubmitted'
  },
  examinerScore: Number,
  examinerScoreDate: Date,
  examinerGrade: { type: String, enum: ['A', 'B', 'C', 'D', 'E', 'F'] },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  receivedAt: Date, // date when examiner acknowledges receipt of the report
  clearedAt: Date,
  resubmission: Boolean, //student is only allowed to resubmit after their examiners comments on report
  reportURL: String, // The physical report is stored on digital ocean spaces
  student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'student' },
  examiner: { type: mongoose.Schema.Types.ObjectId, ref: 'staff' }
});

ReportSchema.methods.isReviewDeadlineExceeded = function() {
  if (this.receivedAt && this.status === 'withExaminer') {
    return Math.abs((Date.now - this.submittedAt) / (1000 * 3600 * 24)) > 30;
  }

  return false;
};

module.exports = mongoose.model('report', ReportSchema);
