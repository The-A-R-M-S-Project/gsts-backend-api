const Program = require('../models/programs');
const Student = require('../models/students');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

module.exports = {
  getProgram: catchAsync(async (req, res, next) => {
    const program = await Program.findById({ _id: req.params.id })
      .populate({ path: 'students', select: 'bioData.name bioData.email -_id' })
      .sort({ name: 1 });

    if (!program) {
      return next(new AppError('No program found with that id', 404));
    }
    res.status(200).send(program);
  }),

  getAllStudentsFromProgram: catchAsync(async (req, res, next) => {
    const students = await Student.find({ program: req.params.id });

    if (!students) {
      return next(new AppError('No Student found under program with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      studentSize: students.length,
      data: {
        students
      }
    });
  })
};
