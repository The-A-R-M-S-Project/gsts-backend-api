const mongoose = require('mongoose');

const ExaminerReportSchema = new mongoose.Schema({
  examiner: { type: mongoose.Schema.Types.ObjectId, ref: 'staff' },
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'report' },
  status: {
    type: String,
    enum: [
      'assignedToExaminer',
      'withExaminer',
      'rejectedByExaminer',
      'clearedByExaminer'
    ],
    default: 'assignedToExaminer'
  },
  examinerType: {
    type: String,
    enum: ['internal', 'external']
  },
  examinerScore: Number,
  examinerScoreDate: Date,
  examinerGrade: { type: String, enum: ['A', 'B', 'C', 'D', 'E', 'F'] },
  reportAssessment: { type: mongoose.Schema.Types.ObjectId, ref: 'reportAssessment' },
  assignedAt: Date,
  receivedAt: Date, // date when examiner acknowledges receipt of the report
  clearedAt: Date
});

ExaminerReportSchema.methods.isReviewDeadlineExceeded = function() {
  if (this.receivedAt && this.status === 'withExaminer') {
    return Math.abs((Date.now - this.assignedAt) / (1000 * 3600 * 24)) > 30;
  }

  return false;
};

module.exports = mongoose.model('examiner_report', ExaminerReportSchema);
