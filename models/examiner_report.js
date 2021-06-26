const mongoose = require('mongoose');

const ExaminerReportSchema = new mongoose.Schema({
  examiner: { type: mongoose.Schema.Types.ObjectId, ref: 'staff' },
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'report' },
  status: {
    type: String,
    enum: [
      'assignedToExaminer',
      'withExaminer',
      'withdrawnFromExaminer',
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
  examinerGrade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E', 'E-', 'F']
  },
  examinerScoreDate: Date,
  rejectionReason: String,
  reportAssessment: { type: mongoose.Schema.Types.ObjectId, ref: 'reportAssessment' },
  assignedAt: Date,
  receivedAt: Date,
  rejectedAt: Date,
  clearedAt: Date
});

ExaminerReportSchema.pre('findOneAndUpdate', async function() {
  if (this._update.examinerScore) {
    if (this._update.examinerScore >= 90) {
      this._update.examinerGrade = 'A+';
    } else if (this._update.examinerScore >= 80) {
      this._update.examinerGrade = 'A';
    } else if (this._update.examinerScore >= 75) {
      this._update.examinerGrade = 'B+';
    } else if (this._update.examinerScore >= 70) {
      this._update.examinerGrade = 'B';
    } else if (this._update.examinerScore >= 65) {
      this._update.examinerGrade = 'C+';
    } else if (this._update.examinerScore >= 60) {
      this._update.examinerGrade = 'C';
    } else if (this._update.examinerScore >= 55) {
      this._update.examinerGrade = 'D+';
    } else if (this._update.examinerScore >= 50) {
      this._update.examinerGrade = 'D';
    } else if (this._update.examinerScore >= 45) {
      this._update.examinerGrade = 'E';
    } else if (this._update.examinerScore >= 40) {
      this._update.examinerGrade = 'E-';
    } else {
      this._update.examinerGrade = 'F';
    }
  }
});

ExaminerReportSchema.methods.isReviewDeadlineExceeded = function() {
  if (this.receivedAt && this.status === 'withExaminer') {
    return Math.abs((Date.now - this.assignedAt) / (1000 * 3600 * 24)) > 30;
  }

  return false;
};

module.exports = mongoose.model('examiner_report', ExaminerReportSchema);
