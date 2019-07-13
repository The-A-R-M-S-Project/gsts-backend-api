const Student = require('../models/students');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

module.exports = {
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
