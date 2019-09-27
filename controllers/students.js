const Student = require('../models/students');
const Report = require('../models/reports');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

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
  updateMe: catchAsync(async (req, res, next) => {
    // 1) Create error if student POSTs password data
    guaranteeNoPasswordInfo(req, res, next);

    // 2) Filtered out unwanted fields names that are not allowed to be updated like role and only allow the following
    const filteredBody = filterObj(
      req.body,
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'photo',
      'program'
    );

    // 3) Update Student document
    const student = await Student.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { student }
    });
  }),

  deactivateMe: catchAsync(async (req, res, next) => {
    await Student.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  }),

  addStudent: catchAsync(async (req, res, next) => {
    const student = await Student.create(req.body);

    res.status(201).json({ student, message: 'Student successfully added!' });
  }),

  getAllStudents: catchAsync(async (req, res, next) => {
    const students = await Student.find();

    res.status(200).json({
      status: 'success',
      results: students.length,
      data: {
        students
      }
    });
  }),

  getStudent: catchAsync(async (req, res, next) => {
    const student = await Student.findById(req.params.id)
      .populate({
        path: 'program',
        select: 'name -_id'
      })
      .populate({
        path: 'report',
        select: '-student'
      });
    if (!student) {
      return next(new AppError('No student exists with that id', 404));
    }
    res.status(200).send(student);
  }),

  updateStudent: catchAsync(async (req, res, next) => {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!student) {
      return next(new AppError('No student found with that id', 404));
    }
    res.json({ message: 'Student information updated!', student });
  }),

  // ----- student report controllers

  getReport: catchAsync(async (req, res, next) => {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return next(new AppError('No student exists with that id', 404));
    }

    const report = await Report.find({ student }).populate({
      path: 'student',
      select: 'firstName lastName -_id'
    });
    if (!report) {
      return next(new AppError('No report found with that id', 404));
    }

    res.status(200).json(report);
  }),

  addReport: catchAsync(async (req, res, next) => {
    const student = await Student.findById(req.params.id).populate('report');
    if (!student) {
      return next(new AppError('No student exists with that id', 404));
    }

    if (student.report) {
      return next(new AppError('You already have a report, update it instead', 403));
    }

    // TODO: Include file uploads with multer
    const report = new Report(req.body);
    report.student = req.params.id;
    await report.save();

    // make sure you do not have password info on this route so that you can update the student document safely
    guaranteeNoPasswordInfo(req, res, next);

    // Update Student document
    await Student.findByIdAndUpdate(
      req.params.id,
      { report: report._id },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(201).json({
      message: 'Report successfully added',
      report
    });
  }),

  updateReport: catchAsync(async (req, res, next) => {
    const student = await Student.findById(req.params.id).populate({
      path: 'report',
      select: '_id'
    });

    if (!student) {
      return next(new AppError('No student exists with that id', 404));
    }

    // TODO: Include file uploads with multer
    const report = await Report.findByIdAndUpdate(student.report._id, req.body, {
      new: true
    });

    if (!report) {
      return next(new AppError('No report found with that id', 404));
    }
    res.status(200).json({ message: 'Report Updated', report });
  })
};
