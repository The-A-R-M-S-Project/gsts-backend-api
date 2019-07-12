const Lecturer = require('../models/lecturers');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

module.exports = {
  getAllLecturers: catchAsync(async (req, res, next) => {
    const lecturers = await Lecturer.find({}).populate('department');

    res.status(200).send(lecturers);
  }),

  getLecturer: catchAsync(async (req, res, next) => {
    const lecturer = await Lecturer.findById(req.params.id).populate(
      'students'
    );

    if (!lecturer) {
      return next(new AppError('No lecturer found with that id', 404));
    }
    res.status(200).send(lecturer);
  })
};
