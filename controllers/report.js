const Report = require('../models/reports');
const Student = require('../models/students');
const Department = require('../models/departments');
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

// helper function that takes in a department ID and returns the report status of that department
const reportStatus = async departmentId => {
  const departmentName = await Department.findById(departmentId);
  const studentIds = await Student.find({ department: departmentId }).distinct('_id');
  const submitted = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        status: { $eq: 'submitted' }
      }
    }
  ]);
  const withExaminer = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        status: { $eq: 'withExaminer' }
      }
    }
  ]);
  const cleared = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        status: { $eq: 'cleared' }
      }
    }
  ]);
  return {
    [departmentName.name]: {
      submitted: submitted.length,
      withExaminer: withExaminer.length,
      cleared: cleared.length
    }
  };
};

module.exports = {
  getAllReports: catchAsync(async (req, res, next) => {
    const reports = await Report.find({}).populate({
      path: 'student',
      select: 'firstName lastName',
      populate: [
        { path: 'program', select: 'name -_id' },
        { path: 'department', select: '-name -__v' }
      ]
    });

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

    res.status(200).json({ message: 'Report Submitted', report });
  }),

  // Staff Report controllers

  getExaminerReports: catchAsync(async (req, res, next) => {
    const reports = await Report.find({
      examiner: req.params.id,
      status: { $ne: 'notSubmitted' }
    }).populate({
      path: 'student',
      populate: [{ path: 'program', select: 'name -_id' }]
    });

    //TODO: Implement sorts and filters for this query

    res.status(200).json({
      status: 'success',
      reports
    });
  }),

  receiveReport: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id).select('status');

    if (!report) {
      return next(new AppError('could not find a report with that ID', 404));
    }

    if (report.status === 'notSubmitted') {
      return next(new AppError(`Can't recieve a report that is not submitted`, 400));
    }

    if (report.status !== 'submitted') {
      return next(new AppError('report already received', 400));
    }

    report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'withExaminer', receivedAt: Date.now() },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      report: report
    });
  }),

  clearReport: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id).select('status');

    if (!report) {
      return next(new AppError('could not find a report with that ID', 404));
    }

    if (report.status === 'submitted') {
      return next(new AppError('acknowledge receipt of report first', 400));
    }

    if (
      report.status === 'clearedByExaminer' ||
      report.status === 'vivaDateSet' ||
      report.status === 'vivaComplete' ||
      report.status === 'pendingRevision' ||
      report.status === 'complete'
    ) {
      return next(new AppError('report already cleared', 400));
    }

    const filteredBody = filterObj(req.body, 'examinerScore');

    if (!Object.prototype.hasOwnProperty.call(filteredBody, 'examinerScore')) {
      return next(
        new AppError('please provide a score for the report before clearing it', 400)
      );
    }

    filteredBody.status = 'clearedByExaminer';
    filteredBody.examinerScoreDate = Date.now();
    filteredBody.examinerGrade = 'C';
    // TODO: Add examinerGrade based on Standard Grading System

    report = await Report.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      report: report
    });
  }),

  assignExaminer: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id).select('status examiner');

    if (!report) {
      return next(new AppError('No report found with that id', 404));
    }

    // only assign examiner for report that has been submitted
    if (report.status === 'notSubmitted') {
      return next(new AppError('cannot assign examiner to unsubmitted report', 400));
    }

    const filteredBody = filterObj(req.body, 'examiner');

    report = await Report.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      report: report
    });
  })
};
