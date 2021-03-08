const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  title: String,
  abstract: String,
  status: {
    type: String,
    enum: [
      'notSubmitted',
      'submitted',
      'assignedToExaminers', //Implies report has been assigned to both internal and external examiners
      'receivedByExaminers', //Implies report has been received to both internal and external examiners
      'clearedByExaminers', //Implies report has been cleared to both internal and external examiners
      'vivaDateSet',
      'vivaComplete',
      'pendingRevision',
      'complete'
    ],
    default: 'notSubmitted'
  },
  finalScore: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date,
  vivaCommitteeReport: String,
  complainceReport: String,
  reportURL: String,
  student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'student' }
});

module.exports = mongoose.model('report', ReportSchema);
