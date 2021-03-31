const mongoose = require('mongoose');
const ExaminerReport = require('./examiner_report');
const Viva = require('./vivas');

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
      'complete'
    ],
    default: 'notSubmitted'
  },
  grade: { type: String, enum: ['A', 'B', 'C', 'D', 'E', 'F'] },
  finalScore: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date,
  assignedAt: Date,
  receivedAt: Date,
  resubmittedAt: Date,
  clearedAt: Date,
  vivaDateSetAt: Date,
  completedAt: Date,
  reportURL: String,
  vivaCommitteeReport: String,
  finalReportURL: String,
  complainceReportURL: String,
  finalSubmissionAt: Date,
  student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'student' }
});

ReportSchema.statics.getReportWithViva = async function(id) {
  const report = await this.findOne({ student: id })
    .populate({
      path: 'student',
      select: 'firstName lastName school _id',
      populate: [
        { path: 'program', select: 'name -_id' },
        { path: 'department', select: '-name -__v' }
      ]
    })
    .lean();

  const viva = await Viva.findOne({ report: report._id })
    .select('-_id vivaEvent vivaScore vivaScoreDate')
    .populate({ path: 'vivaEvent' });

  report.viva = viva;

  return report;
};

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

  // TODO: Replace for of loop with map function
  // eslint-disable-next-line no-restricted-syntax
  for (const report of reports) {
    // eslint-disable-next-line no-await-in-loop
    const examiners = await ExaminerReport.find({ report: report._id })
      .select('-_id status examiner examinerType')
      .populate({ path: 'examiner', select: '-_id firstName lastName school' });

    // eslint-disable-next-line no-await-in-loop
    const viva = await Viva.findOne({ report: report._id })
      .select('-_id vivaEvent vivaCommittee')
      .populate({ path: 'vivaEvent' });

    report.examiners = examiners;
    report.viva = viva;
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

    // eslint-disable-next-line no-await-in-loop
    const viva = await Viva.findOne({ report: report._id })
      .select('-_id vivaEvent vivaCommittee')
      .populate({ path: 'vivaEvent' });

    report.viva = viva;
    report.examiners = examiners;
  }

  const deanReports = reports.filter(report => {
    return deanSchool.equals(report.student.school);
  });

  return deanReports;
};

ReportSchema.statics.getAllDeanSecretaryReports = async function(deanSchool) {
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
    const viva = await Viva.findOne({ report: report._id })
      .select('-_id vivaEvent vivaCommittee')
      .populate({ path: 'vivaEvent' });

    report.viva = viva;
  }

  const deanReports = reports.filter(report => {
    return (
      deanSchool.equals(report.student.school) &&
      (report.status === 'vivaDateSet' || report.status === 'vivaComplete')
    );
  });

  return deanReports;
};

module.exports = mongoose.model('report', ReportSchema);
