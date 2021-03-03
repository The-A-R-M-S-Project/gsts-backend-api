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

module.exports = {
  addVivaCommitteeMember: catchAsync(async (req, res, next) => {
    let viva = await Viva.findOne({ report: req.params.id }).populate({
      path: 'report',
      select: 'title abstract status'
    });

    if (viva.report.status !== 'vivaDateSet') {
      return next(
        new AppError('cannot add a viva member before setting a viva Date', 400)
      );
    }

    if (!viva.vivaCommittee.includes(req.body.vivaCommitteeMemberEmail)) {
      viva.vivaCommittee.push(req.body.vivaCommitteeMemberEmail);
    }

    viva = await viva.save();

    res.status(200).json({
      viva
    });
  }),

  setVivaDate: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id).select(
      'title status examinerScore examinerScoreDate'
    );

    if (!report) {
      return next(new AppError('No report found with that id', 404));
    }

    if (report.status !== 'clearedByExaminers') {
      return next(
        new AppError(
          'Cannot set viva date for uncleared report. Please clear with examiners first',
          400
        )
      );
    }

    // if (!report.finalScore) {
    //   return next(
    //     new AppError(
    //       'Cannot set viva date for ungraded report. Please ensure that report has been graded',
    //       400
    //     )
    //   );
    // }

    const filteredBody = filterObj(req.body, 'vivaDate', 'location');

    report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'vivaDateSet' },
      {
        new: true,
        runValidators: true
      }
    );

    filteredBody.eventDate = new Date(req.body.vivaDate);
    filteredBody.eventType = 'viva';
    filteredBody.title = `${report.title}'s viva`;
    const event = await Event.create(filteredBody);

    filteredBody.report = req.params.id;
    filteredBody.vivaEvent = event;
    // create function only saves fields that were defined in the schema
    const viva = await Viva.create(filteredBody);

    res.status(200).json({
      status: 'success',
      viva
    });
  }),

  setVivaScore: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id).select('status');

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
