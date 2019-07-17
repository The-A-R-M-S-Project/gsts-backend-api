const Lecturer = require('../models/lecturers');
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
  getAllLecturers: catchAsync(async (req, res, next) => {
    const lecturers = await Lecturer.find({}).populate('department');

    res.status(200).send(lecturers);
  }),

  getLecturer: catchAsync(async (req, res, next) => {
    const lecturer = await Lecturer.findById(req.params.id).populate('students');

    if (!lecturer) {
      return next(new AppError('No lecturer found with that id', 404));
    }
    res.status(200).send(lecturer);
  }),

  addLecturer: catchAsync(async (req, res, next) => {
    const lecturer = await Lecturer.create(req.body);

    res.status(201).json({ lecturer, message: 'Lecturer successfully added!' });
  }),

  updateLecturer: catchAsync(async (req, res, next) => {
    const lecturer = await Lecturer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!lecturer) {
      return next(new AppError('No lecturer found with that id', 404));
    }
    res.json({ message: 'Lecturer information updated!', lecturer });
  }),

  updateMe: catchAsync(async (req, res, next) => {
    // 1) Create error if lecturer POSTs password data
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

    // 3) Update Lecturer document
    const lecturer = await Lecturer.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { lecturer }
    });
  }),

  deactivateMe: catchAsync(async (req, res, next) => {
    await Lecturer.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  })
};
