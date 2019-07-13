const Student = require('../models/students');
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
  updateMe: catchAsync(async (req, res, next) => {
    // 1) Create error if student POSTs password data
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
    const student = await Student.findById(req.params.id).populate({
      path: 'program',
      select: 'name -_id'
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
  })
};
