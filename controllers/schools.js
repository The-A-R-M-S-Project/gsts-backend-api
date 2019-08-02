const School = require('../models/schools');
const Department = require('../models/departments');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

module.exports = {
  createSchool: catchAsync(async (req, res, next) => {
    const school = await School.create(req.body);

    res.status(201).json({
      message: 'School successfully added!',
      school
    });
  }),

  getSchool: catchAsync(async (req, res, next) => {
    const school = await School.findById(req.params.id);

    if (!school) {
      return next(new AppError('No school found with that ID', 404));
    }

    res.status(200).json(school);
  }),

  getAllDepartmentsFromSchool: catchAsync(async (req, res, next) => {
    const departments = await Department.find({ school: req.params.id });

    if (!departments) {
      return next(new AppError('No departments found under school with that id', 404));
    }

    res.status(200).json({
      departments: departments
    });
  }),

  getAllSchools: catchAsync(async (req, res, next) => {
    const schools = await School.find({}).sort({ name: 1 });

    res.status(200).json(schools);
  }),

  updateSchool: catchAsync(async (req, res, next) => {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!school) {
      return next(new AppError('No school found with that ID', 404));
    }

    res.status(200).json({ message: 'School updated!', school });
  }),

  deleteSchool: catchAsync(async (req, res, next) => {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) {
      return next(new AppError('No school found with that ID', 404));
    }
    res.status(204).json({ message: 'School successfully deleted!' });
  })
};
