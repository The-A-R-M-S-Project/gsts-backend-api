const Report = require('../models/reports');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

module.exports = {
  addReport: catchAsync(async (req, res, next) => {
    const report = await Report.create(req.body);

    res.status(201).json({
      message: 'Report successfully added',
      report
    });
  }),
  getAllReports: catchAsync(async (req, res, next) => {
    const reports = await Report.find({});

    res.status(200).json(reports);
  }),

  getReport: catchAsync(async (req, res, next) => {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return next(new AppError('No report found with that id', 404));
    }

    res.status(200).json(report);
  }),
  updateReport: catchAsync(async (req, res, next) => {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!report) {
      return next(new AppError('No report found with that id', 404));
    }
    res.status(200).json({ message: 'Report Updated', report });
  })
};
