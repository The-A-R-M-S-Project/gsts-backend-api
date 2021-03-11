const mongoose = require('mongoose');
const ExaminerReport = require('./examiner_report');

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

ReportSchema.statics.getAllReportsWithExaminers = async function() {
  const reports = await this.find({})
    .populate({
      path: 'student',
      select: 'firstName lastName',
      populate: [
        { path: 'program', select: 'name -_id' },
        { path: 'department', select: '-name -__v' }
      ]
    })
    .lean();

  // eslint-disable-next-line no-restricted-syntax
  for (const report of reports) {
    // eslint-disable-next-line no-await-in-loop
    const examiners = await ExaminerReport.find({ report: report._id })
      .select('-_id status examiner examinerType')
      .populate({ path: 'examiner', select: '-_id firstName lastName school' });
    report.examiners = examiners;
  }

  return reports;
};

ReportSchema.statics.getAllDeanReportsWithExaminers = async function(deanSchool) {
  const reports = await this.find({})
    .populate({
      path: 'student',
      select: 'firstName lastName school',
      populate: [
        { path: 'program', select: 'name -_id' },
        { path: 'department', select: '-name -__v' }
      ]
    })
    .lean();

  // eslint-disable-next-line no-restricted-syntax
  for (const report of reports) {
    // eslint-disable-next-line no-await-in-loop
    const examiners = await ExaminerReport.find({ report: report._id })
      .select('-_id status examiner examinerType')
      .populate({ path: 'examiner', select: '-_id firstName lastName school' });
    report.examiners = examiners;
  }

  const deanReports = reports.filter(report => {
    return deanSchool.equals(report.student.school);
  });

  return deanReports;
};

module.exports = mongoose.model('report', ReportSchema);
