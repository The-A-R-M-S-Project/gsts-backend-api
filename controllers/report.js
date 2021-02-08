const Report = require('../models/reports');
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
  getReport: catchAsync(async (req, res, next) => {
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

  updateReport: catchAsync(async (req, res, next) => {
    let report = await Report.findOne({ student: req.params.id });

    if (!report) {
      return next(new AppError('No report found with that for that student', 404));
    }

    if (report.status !== 'notSubmitted' && report.status !== 'pendingRevision') {
      return next(new AppError('Cannot edit already submitted report', 400));
    }

    const filteredBody = filterObj(req.body, 'title', 'abstract');
    filteredBody.reportURL = req.file.location;

    report = await Report.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true
    }).populate({
      path: 'student',
      select: 'firstName lastName _id'
    });

    if (!report) {
      return next(new AppError('No report found with that id', 404));
    }
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
  })
};
