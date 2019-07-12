const Department = require('../models/departments');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

module.exports = {
  getAllDepartments: catchAsync(async (req, res, next) => {
    const departments = await Department.find({})
      .populate({ path: 'programs', select: 'name -_id' })
      .sort({ name: 1 });

    res.status(200).json(departments);
  }),

  getDepartment: catchAsync(async (req, res, next) => {
    const department = await Department.findById(req.params.id).populate({
      path: 'programs',
      select: 'name -_id'
    });

    if (!department) {
      return next(new AppError('No department found with that id', 404));
    }
    res.status(200).json(department);
  }),

  getAllProgramsFromDepartment: async (req, res, next) => {
    const department = await Department.findById(req.params.id)
      .populate({ path: 'programs', select: 'name _id' })
      .sort({ name: 1 });

    if (!department) {
      return next(new AppError('No department found with that id', 404));
    }
    res.status(200).json({ department, programs: department.programs });
  }
};
