const Report = require('../models/reports');
const Staff = require('../models/staff');
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

function determineGrade(score) {
  let grade;
  if (score >= 90) {
    grade = 'A+';
  } else if (score >= 80) {
    grade = 'A';
  } else if (score >= 75) {
    grade = 'B+';
  } else if (score >= 70) {
    grade = 'B';
  } else if (score >= 65) {
    grade = 'C+';
  } else if (score >= 60) {
    grade = 'C';
  } else if (score >= 55) {
    grade = 'D+';
  } else if (score >= 50) {
    grade = 'D';
  } else if (score >= 45) {
    grade = 'E';
  } else if (score >= 40) {
    grade = 'E-';
  } else if (score < 40) {
    grade = 'F';
  }

  return grade;
}

module.exports = {
  getSetVivaDateStudents: catchAsync(async (req, res, next) => {
    //Find the school of this secretary's dean
    const dean = await Staff.Dean.findById(req.user.dean);
    const vivas = await Report.getAllDeanSecretaryReports(dean.school);

    res.status(200).json({
      status: 'success',
      vivas
    });
  }),

  addVivaCommitteeMember: catchAsync(async (req, res, next) => {
    let viva = await Viva.findOneAndUpdate(
      {
        report: req.params.report_id
      },
      { $set: { report: req.params.report_id } },
      { upsert: true, new: true }
    ).populate({
      path: 'report',
      select: 'status'
    });

    if (viva.report.status === 'notSubmitted' || viva.report.status === 'resubmit') {
      return next(
        new AppError(
          'Cannot add viva committee member to a report that is not submitted',
          404
        )
      );
    }

    const filteredBody = filterObj(req.body, 'name', 'email', 'phone', 'affiliation');

    // eslint-disable-next-line no-restricted-syntax
    for (const member of viva.vivaCommittee) {
      if (member.email === req.body.email) {
        return next(
          new AppError('Cannot add duplicate email for viva committee member', 404)
        );
      }
    }

    viva.vivaCommittee.push(filteredBody);

    viva = await viva.save();

    res.status(200).json({
      status: 'success',
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

    const filteredBody = filterObj(req.body, 'vivaDate', 'location');

    report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'vivaDateSet', vivaDateSetAt: Date.now() },
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

    const viva = await Viva.findOneAndUpdate(
      {
        report: filteredBody.report
      },
      { $set: filteredBody },
      { upsert: true, new: true }
    );

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
      { status: 'vivaComplete', vivaCompleteAt: Date.now() },
      {
        new: true,
        runValidators: true
      }
    );

    const filteredBody = filterObj(req.body, 'vivaScore');
    filteredBody.vivaGrade = determineGrade(filteredBody.vivaScore);
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
