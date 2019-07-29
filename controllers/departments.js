const Department = require('../models/departments');
const Program = require('../models/programs');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

module.exports = {
  getAllDepartments: catchAsync(async (req, res, next) => {
    const departments = await Department.find({}).sort({ name: 1 });

    res.status(200).json(departments);
  }),

  getDepartment: catchAsync(async (req, res, next) => {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return next(new AppError('No department found with that id', 404));
    }
    res.status(200).json(department);
  }),

  getAllProgramsFromDepartment: catchAsync(async (req, res, next) => {
    const programs = await Program.find({ department: req.params.id });

    if (!programs) {
      return next(new AppError('No department found with that id', 404));
    }
    res.status(200).json({ programs });
  })
};
