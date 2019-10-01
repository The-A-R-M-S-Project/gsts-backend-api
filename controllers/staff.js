const Staff = require('../models/staff');
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

module.exports = {
  getAllStaff: catchAsync(async (req, res, next) => {
    const staff = await Staff.find({});

    res.status(200).send(staff);
  }),

  getStaff: catchAsync(async (req, res, next) => {
    const staff = await Staff.findById(req.params.id).populate('students');

    if (!staff) {
      return next(new AppError('No staff found with that id', 404));
    }
    res.status(200).send(staff);
  }),

  addStaff: catchAsync(async (req, res, next) => {
    const staff = await Staff.create(req.body);

    res.status(201).json({ staff, message: 'Staff successfully added!' });
  }),

  updateStaff: catchAsync(async (req, res, next) => {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!staff) {
      return next(new AppError('No staff found with that id', 404));
    }
    res.json({ message: 'Staff information updated!', staff });
  }),

  updateMe: catchAsync(async (req, res, next) => {
    // 1) Create error if staff POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updatePassword.',
          400
        )
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated like role and only allow the following
    const filteredBody = filterObj(
      req.body,
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'photo'
    );

    // 3) Update Staff document
    const staff = await Staff.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { staff }
    });
  }),

  deactivateMe: catchAsync(async (req, res, next) => {
    await Staff.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  }),

  // Staff Report controllers

  getReport: catchAsync(async (req, res, next) => {
    const reports = await Report.find({
      examiner: req.params.id,
      status: 'submitted'
    }).populate({
      path: 'student'
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

    if (report.status !== 'notSubmitted') {
      return next(new AppError('report already received', 400));
    }

    report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'submitted' },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      report: report
    });
  })
};
