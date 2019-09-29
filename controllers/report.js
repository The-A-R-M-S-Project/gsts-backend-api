const Report = require('../models/reports');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

module.exports = {
  getAllReports: catchAsync(async (req, res, next) => {
    const reports = await Report.find({}).populate({
      path: 'student',
      select: 'firstName lastName'
    });

    res.status(200).json(reports);
  })
};
