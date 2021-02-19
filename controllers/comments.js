const Report = require('../models/reports');
const Comment = require('../models/comments');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

module.exports = {
  getALlReportComments: catchAsync(async (req, res, next) => {
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return next(new AppError('No report with that id exists', 404));
    }

    const comments = await Comment.find({ report: req.params.reportId })
      .populate({
        path: 'staff',
        select: 'firstName lastName role _id'
      })
      .populate({
        path: 'report',
        select: 'title status'
      });

    if (comments.length === 0) {
      return next(new AppError('No comments have been made on this report', 404));
    }

    res.status(200).json({
      status: 'success',
      comments
    });
  }),

  updateComment: catchAsync(async (req, res, next) => {
    const filteredBody = filterObj(req.body, 'text');
    const comment = await Comment.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true
    }).populate({
      path: 'staff',
      select: 'firstName lastName role _id'
    });

    res.status(200).json({
      status: 'success',
      comment
    });
  }),

  addComment: catchAsync(async (req, res, next) => {
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return next(new AppError('No report with that id exists', 404));
    }
    const filteredBody = filterObj(req.body, 'text');
    filteredBody.staff = req.params.id;
    filteredBody.report = req.params.reportId;
    const comment = await Comment.create(filteredBody);

    res.status(200).json({
      status: 'success',
      comment
    });
  }),

  getAllComments: catchAsync(async (req, res, next) => {
    const comments = await Comment.find({});

    res.status(200).json({
      status: 'success',
      comments
    });
  })
};
