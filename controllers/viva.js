const Report = require('../models/reports');
const Viva = require('../models/vivas');
const Event = require('../models/events');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const guaranteeNoPasswordInfo = (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword.',
        400
      )
    );
  }
};

module.exports = {
  setVivaDate: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id).select(
      'status examinerScore examinerScoreDate'
    );

    if (!report) {
      return next(new AppError('No report found with that id', 404));
    }

    if (report.status !== 'clearedByExaminer') {
      return next(
        new AppError(
          'Cannot set viva date for uncleared report. Please clear with examiner first',
          400
        )
      );
    }

    if (!report.examinerScore && !report.examinerScoreDate) {
      return next(
        new AppError(
          'Cannot set viva date for ungraded report. Please ensure that report has been graded',
          400
        )
      );
    }

    const filteredBody = filterObj(req.body, 'vivaDate');

    report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'vivaDateSet' },
      {
        new: true,
        runValidators: true
      }
    );
    const event = await Event.create({
      eventDate: req.body.vivaDate,
      eventType: 'viva'
    });

    filteredBody.report = req.params.id;
    filteredBody.vivaEvent = event;
    const viva = await Viva.create(filteredBody).populate({ path: 'vivaEvent' });

    res.status(200).json({
      status: 'success',
      viva
    });
  }),

  setVivaScore: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id).select('status vivaDate');

    if (!report) {
      return next(new AppError('No report found with that id', 404));
    }

    if (report.status !== 'vivaDateSet') {
      return next(
        new AppError(
          'Cannot set viva score for report without viva date. Please set a viva date and update score',
          400
        )
      );
    }

    report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'vivaComplete' },
      {
        new: true,
        runValidators: true
      }
    );

    const filteredBody = filterObj(req.body, 'vivaScore');
    filteredBody.vivaScoreDate = Date.now();
    filteredBody.vivaStatus = 'done';

    const viva = await Viva.findOneAndUpdate({ report: req.params.id }, filteredBody, {
      new: true,
      runValidators: true
    })
      .populate({
        path: 'report'
      })
      .populate({
        path: 'vivaEvent'
      });
    res.status(200).json({
      status: 'success',
      viva
    });
  })
};
