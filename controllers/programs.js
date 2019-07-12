const Program = require('../models/programs');
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

  getStudentsFromProgram: catchAsync(async (req, res, next) => {
    const program = await Program.findById(req.params.id).populate('students');

    if (!program) {
      return next(new AppError('No proram found with that id', 404));
    }
    res.status(200).send(program.students);
  })
};
