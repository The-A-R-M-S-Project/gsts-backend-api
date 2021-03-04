const Report = require('../models/reports');
const Comment = require('../models/comments');
const ExaminerReport = require('../models/examiner_report');
const ReportAssessment = require('../models/report_assessment');
const Student = require('../models/students');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const guaranteeNoPasswordInfo = (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword.',
        400
      )
    );
  }
};

module.exports = {
  getAllReports: catchAsync(async (req, res, next) => {
    const reports = await Report.find({})
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

    res.status(200).json(reports);
  }),
  getMyReport: catchAsync(async (req, res, next) => {
    const report = await Report.findOne({ student: req.params.id }).populate({
      path: 'student',
      select: 'firstName lastName _id'
    });
    if (!report) {
      return next(new AppError('No report found with that for that student', 404));
    }

    res.status(200).json(report);
  }),

  getStudentReport: catchAsync(async (req, res, next) => {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return next(new AppError('No student exists with that id', 404));
    }

    const report = await Report.findOne({ student }).populate({
      path: 'student',
      select: 'firstName lastName _id'
    });

    if (!report) {
      return next(new AppError('No report found with that id', 404));
    }

    //Ensure Dean doesn't make operations to objects belonging to other schools
    if (req.user.role === 'dean') {
      if (req.user.school !== report.student.school) {
        return next(
          new AppError('Dean Cannot get Report belonging to other schools', 400)
        );
      }
    }
    if (req.user.role === 'examiner') {
      if (req.user._id !== report.examiner) {
        return next(
          new AppError('Examiner cannot get report that is not assigned to them', 400)
        );
      }
    }

    res.status(200).json(report);
  }),

  addReport: catchAsync(async (req, res, next) => {
    let report = await Report.findOne({ student: req.params.id });
    if (report) {
      return next(new AppError('You already have a report, update it instead', 403));
    }

    const filteredBody = filterObj(req.body, 'title', 'abstract');
    filteredBody.student = req.params.id;
    report = new Report(filteredBody);

    await report.save();

    // make sure you do not have password info on this route so that you can update the student document safely
    guaranteeNoPasswordInfo(req, res, next);

    res.status(201).json({
      message: 'Report successfully added',
      report
    });
  }),

  updateMyReport: catchAsync(async (req, res, next) => {
    let report = await Report.findOne({ student: req.params.id });

    if (!report) {
      return next(new AppError('No report found with that for that student', 404));
    }

    if (report.status !== 'notSubmitted' && report.status !== 'pendingRevision') {
      return next(new AppError('Cannot edit already submitted report', 400));
    }

    const filteredBody = filterObj(req.body, 'title', 'abstract');
    if (req.file) {
      filteredBody.reportURL = req.file.location;
    }

    report = await Report.findByIdAndUpdate(report._id, filteredBody, {
      new: true
    }).populate({
      path: 'student',
      select: 'firstName lastName _id'
    });

    res.status(200).json({ message: 'Report Updated', report });
  }),

  submitReport: catchAsync(async (req, res, next) => {
    let report = await Report.findOne({ student: req.params.id });

    if (!report) {
      return next(new AppError('No report found with that for that student', 404));
    }

    if (report.status !== 'notSubmitted') {
      return next(new AppError('Already submitted report', 400));
    }

    // multer middleware adds a file object to the request including the details about where the file is stored
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    const filteredBody = filterObj(req.body, 'title', 'abstract');
    filteredBody.status = 'submitted';
    filteredBody.submittedAt = Date.now();
    filteredBody.reportURL = req.file.location;

    report = await Report.findByIdAndUpdate(report._id, filteredBody, {
      new: true
    }).populate({
      path: 'student',
      select: 'firstName lastName _id'
    });

    res.status(200).json({ status: 'success', message: 'Report Submitted', report });
  }),

  // Staff Report controllers

  getExaminerReports: catchAsync(async (req, res, next) => {
    const reports = await ExaminerReport.find({
      examiner: req.params.id
    }).populate({
      path: 'report',
      populate: [
        {
          path: 'student',
          select: 'firstName lastName program department _id',
          populate: [
            { path: 'program', select: 'name -_id' },
            { path: 'department', select: '-name -__v' }
          ]
        }
      ]
    });

    //TODO: Implement sorts and filters for this query

    res.status(200).json({
      status: 'success',
      reports
    });
  }),

  resubmitReport: catchAsync(async (req, res, next) => {
    const report = await Report.findById(req.params.id).select('student status');

    if (!report) {
      return next(new AppError('could not find a report with that ID', 404));
    }

    if (report.status === 'notSubmitted') {
      return next(
        new AppError('report hasnot yet been submitted, cannot complete this action', 400)
      );
    }

    if (
      report.status === 'assignedToExaminers' ||
      report.status === 'recievedByExaminers'
    ) {
      return next(
        new AppError(
          'report is being assessed by examiners, cannot complete this action ',
          400
        )
      );
    }

    report.status = 'notSubmitted';
    const filteredBody = filterObj(req.body, 'text');
    filteredBody.reason = `The ${req.user.role} has requested for this report to be resubmitted`;
    filteredBody.staff = req.user._id;
    filteredBody.student = report.student;
    filteredBody.report = req.params.id;

    const comment = await Comment.create(filteredBody);

    res.status(201).json({
      status: 'success',
      examinerReport: comment
    });
  }),

  uploadVivaCommitterreport: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id);

    if (!report) {
      return next(new AppError('No report found with that for that student', 404));
    }

    if (report.status !== 'vivaComplete') {
      return next(
        new AppError('cannot upload a report for a viva that is not complete', 400)
      );
    }

    // multer middleware adds a file object to the request including the details about where the file is stored
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    report = await Report.findByIdAndUpdate(
      report._id,
      { vivaCommitteeReport: req.file.location },
      {
        new: true
      }
    ).populate({
      path: 'student',
      select: 'firstName lastName name _id'
    });

    res.status(200).json({ status: 'success', report: report });
  }),

  receiveReport: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id)
      .select('status examinerInternal student')
      .populate({
        path: 'student'
      });

    if (!report) {
      return next(new AppError('could not find a report with that ID', 404));
    }

    if (report.status === 'notSubmitted') {
      return next(new AppError(`Can't recieve a report that is not submitted`, 400));
    }

    let examinerReport = await ExaminerReport.findOne({
      report: req.params.id,
      examiner: req.user._id
    });

    if (!examinerReport) {
      return next(
        new AppError('examiner cannot recieve Report that isnt assigned to them', 400)
      );
    }

    if (examinerReport.status !== 'assignedToExaminer') {
      return next(new AppError('report already received', 400));
    }

    examinerReport.status = 'withExaminer';
    examinerReport.save();

    const numberOfExaminers = await ExaminerReport.countDocuments({
      report: req.params.id,
      status: 'withExaminer'
    });

    if (numberOfExaminers === 2) {
      report = await Report.findByIdAndUpdate(
        req.params.id,
        { status: 'recievedByExaminers' },
        {
          new: true,
          runValidators: true
        }
      );
    }

    examinerReport = await ExaminerReport.findOne({
      report: req.params.id,
      examiner: req.user._id
    })
      .populate({ path: 'report', select: 'status _id title' })
      .populate({ path: 'examiner', select: 'firstName LastName _id' });

    res.status(200).json({
      status: 'success',
      examinerReport: examinerReport
    });
  }),

  rejectReport: catchAsync(async (req, res, next) => {
    const report = await Report.findById(req.params.id)
      .select('status examinerInternal student')
      .populate({
        path: 'student'
      });

    if (!report) {
      return next(new AppError('could not find a report with that ID', 404));
    }

    if (report.status === 'notSubmitted') {
      return next(new AppError(`Can't recieve a report that is not submitted`, 400));
    }

    let examinerReport = await ExaminerReport.findOne({
      report: req.params.id,
      examiner: req.user._id
    });

    if (!examinerReport) {
      return next(
        new AppError('examiner cannot recieve Report that isnt assigned to them', 400)
      );
    }

    if (examinerReport.status === 'rejectedByExaminer') {
      return next(new AppError('report already rejected, cannot reject twice', 400));
    }

    if (examinerReport.status !== 'assignedToExaminer') {
      return next(new AppError('report already received', 400));
    }

    examinerReport.status = 'rejectedByExaminer';
    examinerReport.save();

    examinerReport = await ExaminerReport.findOne({
      report: req.params.id,
      examiner: req.user._id
    }).populate({ path: 'report', select: 'status _id title' });

    res.status(200).json({
      status: 'success',
      examinerReport: examinerReport
    });
  }),

  clearReport: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id).select('status');

    if (!report) {
      return next(new AppError('could not find a report with that ID', 404));
    }

    let examinerReport = await ExaminerReport.findOne({
      report: req.params.id,
      examiner: req.user._id
    });

    if (!examinerReport) {
      return next(
        new AppError('examiner cannot recieve Report that isnt assigned to them', 400)
      );
    }

    if (examinerReport.status === 'assignedToExaminer') {
      return next(new AppError('acknowledge receipt of report first', 400));
    }

    if (examinerReport.status === 'clearedByExaminer') {
      return next(new AppError('report already cleared', 400));
    }

    const filteredBody = filterObj(req.body, 'examinerScore');
    const assessment = filterObj(
      req.body,
      'background',
      'problemStatement',
      'researchMethods',
      'results',
      'discussions',
      'conclusions',
      'recommendations',
      'originality_of_Contribution',
      'literature_Citation',
      'overall_Presentation',
      'corrections'
    );

    if (!Object.prototype.hasOwnProperty.call(filteredBody, 'examinerScore')) {
      return next(
        new AppError('please provide a score for the report before clearing it', 400)
      );
    }

    let reportAssessment;
    if (!req.file) {
      reportAssessment = await ReportAssessment.create({ assessment: assessment });
    } else {
      reportAssessment = await ReportAssessment.create({
        scannedAsssesmentform: req.file.location
      });
    }

    filteredBody.reportAssessment = reportAssessment;
    filteredBody.status = 'clearedByExaminer';
    filteredBody.examinerScoreDate = Date.now();
    filteredBody.examinerGrade = 'C';
    // TODO: Add examinerGrade based on Standard Grading System

    examinerReport = await ExaminerReport.findOneAndUpdate(
      { examiner: req.user._id, report: req.params.id },
      filteredBody,
      {
        new: true
      }
    )
      .populate({ path: 'report', select: 'status _id title' })
      .populate({ path: 'reportAssessment' });

    const numberOfExaminers = await ExaminerReport.countDocuments({
      report: req.params.id,
      status: 'clearedByExaminer'
    });

    if (numberOfExaminers === 2) {
      report = await Report.findByIdAndUpdate(
        req.params.id,
        { status: 'clearedByExaminers' },
        {
          new: true,
          runValidators: true
        }
      );
    }

    res.status(200).json({
      status: 'success',
      examinerReport: examinerReport
    });
  }),

  assignExaminer: catchAsync(async (req, res, next) => {
    const report = await Report.findById(req.params.id)
      .select('status examiner student')
      .populate({
        path: 'student'
      });

    if (!report) {
      return next(new AppError('No report found with that id', 404));
    }

    //Ensure Dean doesn't make operations to students belonging to other schools
    if (req.user.role === 'dean') {
      if (!req.user.school.equals(report.student.school)) {
        return next(
          new AppError('Dean cant assign Student report belonging to other schools', 400)
        );
      }
    }

    // only assign examiner for report that has been submitted
    if (report.status === 'notSubmitted') {
      return next(new AppError('cannot assign examiner to unsubmitted report', 400));
    }

    const numberOfInternalExaminers = await ExaminerReport.countDocuments({
      report: req.params.id,
      examinerType: 'internal',
      status: { $nin: ['assignedToExaminer', 'rejectedByExaminer'] }
    });

    const numberOfExternalExaminers = await ExaminerReport.countDocuments({
      report: req.params.id,
      examinerType: 'external',
      status: { $nin: ['assignedToExaminer', 'rejectedByExaminer'] }
    });

    if (numberOfInternalExaminers > 0) {
      return next(
        new AppError(
          'report already accepted by internal examiner, cannot assign more than one internal examiner',
          400
        )
      );
    }

    if (numberOfExternalExaminers > 0) {
      return next(
        new AppError(
          'report already accepted by external examiner, cannot assign more than one external examiner',
          400
        )
      );
    }

    const filteredBody = filterObj(req.body, 'examinerType', 'examiner');
    filteredBody.report = req.params.id;
    filteredBody.status = 'assignedToExaminer';
    filteredBody.assignedAt = Date.now();

    const examinerReport = await ExaminerReport.findOneAndUpdate(
      { examiner: filteredBody.examiner, report: filteredBody.report },
      { $set: filteredBody },
      { upsert: true, new: true }
    ).populate({ path: 'report', select: 'status _id title' });

    const numberOfExaminers = await ExaminerReport.countDocuments({
      report: req.params.id,
      status: 'assignedToExaminer'
    });

    if (numberOfExaminers === 2) {
      report.status = 'assignedToExaminers';
      await report.save();
    }

    res.status(200).json({
      status: 'success',
      examinerReport: examinerReport
    });
  }),

  examinerGetReportstatus: catchAsync(async (req, res, next) => {
    const examinerReports = await ExaminerReport.find({ examiner: req.user._id })
      .populate({ path: 'report', select: 'status _id title' })
      .populate({ path: 'examiner', select: 'firstName lastName school' });

    res.status(200).json({
      status: 'success',
      examinerReports: examinerReports
    });
  }),

  getExaminerReportstatus: catchAsync(async (req, res, next) => {
    const examinerReports = await ExaminerReport.find({ report: req.params.id })
      .populate({ path: 'report', select: 'status _id title' })
      .populate({ path: 'examiner', select: 'firstName lastName school' });

    res.status(200).json({
      status: 'success',
      examinerReports: examinerReports
    });
  })
};
