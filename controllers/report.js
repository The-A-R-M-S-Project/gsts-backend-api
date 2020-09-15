const Report = require('../models/reports');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { populate } = require('../models/reports');

module.exports = {
  getAllReports: catchAsync(async (req, res, next) => {
    const reports = await Report.find({}).populate({
      path: 'student',
      select: 'firstName lastName',
      populate: [
        { path: 'program', select: 'name -_id' },
        { path: 'department', select: '-name -__v' }
      ]
    });

    res.status(200).json(reports);
  })
};
