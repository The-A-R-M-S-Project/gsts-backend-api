const { Staff, Principal, Dean } = require('../models/staff');
const Report = require('../models/reports');
const Student = require('../models/students');
const School = require('../models/schools');
const Department = require('../models/departments');
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

  getAllDeans: catchAsync(async (req, res, next) => {
    const deans = await Principal.getALLDeans();

    res.status(200).send(deans);
  }),

  getStaff: catchAsync(async (req, res, next) => {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return next(new AppError('No staff found with that id', 404));
    }
    res.status(200).send(staff);
  }),

  getSecretarySchool: catchAsync(async (req, res, next) => {
    let secretaryDean = await Staff.findById(req.params.id);
    let schoolOfDean = await School.findById(secretaryDean.school);
    res.status(200).json({ message: 'Success', schoolOfDean });
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
  })
};
