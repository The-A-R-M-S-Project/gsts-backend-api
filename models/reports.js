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
      'resubmit',
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
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E', 'E-', 'F']
  },
  finalScore: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  retake: { type: 'String', enum: ['yes', 'no'], default: 'no' },
  submittedAt: Date,
  assignedAt: Date,
  receivedAt: Date,
  updatedAt: Date,
  resubmittedAt: Date,
  clearedAt: Date,
  vivaDateSetAt: Date,
  vivaCompleteAt: Date,
  completedAt: Date,
  reportURL: String,
  resubmittedReportURL: String,
  vivaCommitteeReport: String,
  principalRequestedExaminer: { type: Boolean, default: false },
  finalReportURL: String,
  complainceReportURL: String,
  finalSubmissionAt: Date,
  student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'student' }
});

function determineGrade(score) {
  let grade;
  if (score >= 90) {
    grade = 'A+';
  } else if (score >= 80) {
    grade = 'A';
  } else if (score >= 75) {
    grade = 'B+';
  } else if (score >= 70) {
    grade = 'B';
  } else if (score >= 65) {
    grade = 'C+';
  } else if (score >= 60) {
    grade = 'C';
  } else if (score >= 55) {
    grade = 'D+';
  } else if (score >= 50) {
    grade = 'D';
  } else if (score >= 45) {
    grade = 'E';
  } else if (score >= 40) {
    grade = 'E-';
  } else if (score < 40) {
    grade = 'F';
  }

  return grade;
}

ReportSchema.statics.getReportWithExaminerViva = async function(id) {
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

  if (report) {
    const examiner = await ExaminerReport.find({ report: report._id })
      .select('-_id status examiner examinerType')
      .populate({
        path: 'examiner',
        select: '_id firstName lastName school rejectionReason examinerScore'
      });

    const viva = await Viva.findOne({ report: report._id })
      .select('_id vivaEvent vivaScore vivaScoreDate')
      .populate({ path: 'vivaEvent' });

    report.viva = viva;
    report.examiner = examiner;
  }

  return report;
};

ReportSchema.statics.getAllReportsWithExaminers = async function() {
  const reports = await this.find({})
    .populate({
      path: 'student',
      select: 'firstName lastName name',
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
      .select('-_id status examiner examinerType rejectionReason')
      .populate({
        path: 'examiner',
        select: '_id firstName lastName school rejectionReason examinerScore'
      });

    // eslint-disable-next-line no-await-in-loop
    const viva = await Viva.findOne({ report: report._id })
      .select('_id vivaEvent vivaCommittee')
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
      select: 'firstName lastName school name',
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
      .select('-_id status examiner examinerType rejectionReason')
      .populate({
        path: 'examiner',
        select: '_id firstName lastName school rejectionReason examinerScore'
      });

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

ReportSchema.methods.calculateFinalGrade = async function() {
  let sum = 0;
  const examinerScores = await ExaminerReport.find({ report: this._id })
    .select('examinerScore')
    .lean();

  examinerScores.forEach(value => {
    sum += value.examinerScore;
  });
  this.finalScore = Math.round(sum / 3);
  this.grade = determineGrade(this.finalScore);
  if (this.finalScore < 60) {
    // revert progress back to notSubmitted and move student's data into another folder in server.
    this.status = 'notSubmitted';
    this.retake = 'yes';
  }
};

module.exports = mongoose.model('report', ReportSchema);
