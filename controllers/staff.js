const Staff = require('../models/staff');
const Report = require('../models/reports');
const Student = require('../models/students');
const Department = require('../models/departments');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// helper function that takes in a department ID and returns the report status of that department
const reportStatus = async departmentId => {
  const departmentName = await Department.findById(departmentId);
  const studentIds = await Student.find({ department: departmentId }).distinct('_id');
  const submitted = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        status: { $eq: 'submitted' }
      }
    }
  ]);
  const withExaminer = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        status: { $eq: 'withExaminer' }
      }
    }
  ]);
  const cleared = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        status: { $eq: 'cleared' }
      }
    }
  ]);
  return {
    [departmentName.name]: {
      submitted: submitted.length,
      withExaminer: withExaminer.length,
      cleared: cleared.length
    }
  };
};

// helper function that takes in a department ID and returns the performance of that department
const performance = async departmentId => {
  const departmentName = await Department.findById(departmentId);
  const studentIds = await Student.find({ department: departmentId }).distinct('_id');
  const numA = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        examinerGrade: { $eq: 'A' }
      }
    }
  ]);
  const numB = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        examinerGrade: { $eq: 'B' }
      }
    }
  ]);
  const numC = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        examinerGrade: { $eq: 'C' }
      }
    }
  ]);
  const numD = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        examinerGrade: { $eq: 'D' }
      }
    }
  ]);
  const numE = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        examinerGrade: { $eq: 'E' }
      }
    }
  ]);
  const numF = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        examinerGrade: { $eq: 'F' }
      }
    }
  ]);

  return {
    [departmentName.name]: [
      numA.length,
      numB.length,
      numC.length,
      numD.length,
      numE.length,
      numF.length
    ]
  };
};

module.exports = {
  getAllStaff: catchAsync(async (req, res, next) => {
    const staff = await Staff.find({});

    res.status(200).send(staff);
  }),

  getStaff: catchAsync(async (req, res, next) => {
    const staff = await Staff.findById(req.params.id).populate('students');

    if (!staff) {
      return next(new AppError('No staff found with that id', 404));
    }
    res.status(200).send(staff);
  }),

  addStaff: catchAsync(async (req, res, next) => {
    const staff = await Staff.create(req.body);

    res.status(201).json({ staff, message: 'Staff successfully added!' });
  }),

  updateStaff: catchAsync(async (req, res, next) => {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!staff) {
      return next(new AppError('No staff found with that id', 404));
    }
    res.json({ message: 'Staff information updated!', staff });
  }),

  dashboardStats: catchAsync(async (req, res, next) => {
    // aggregation pipeline for dashboard
    const { school } = req.params;

    // find students within that particular school
    const studentIds = await Student.findById(school).distinct('_id');
    const departmentIds = await Department.find({
      school: req.params.school
    }).distinct('_id');

    const done = await Report.aggregate([
      {
        $match: { student: { $in: studentIds } }
      },
      {
        $match: {
          $or: [
            { status: { $eq: 'vivaComplete' } },
            { status: { $eq: 'pendingRevision' } },
            { status: { $eq: 'complete' } }
          ]
        }
      }
    ]);

    const pending = await Report.aggregate([
      {
        $match: { student: { $in: studentIds } }
      },
      {
        $match: {
          $or: [
            { status: { $eq: 'notSubmitted' } },
            { status: { $eq: 'submitted' } },
            { status: { $eq: 'withExaminer' } },
            { status: { $eq: 'clearedByExaminer' } },
            { status: { $eq: 'vivaDateSet' } }
          ]
        }
      }
    ]);

    const rprtStatus = [];
    const reportPromises = departmentIds.map(async id => {
      rprtStatus.push(await reportStatus(id));
    });

    const perform = [];
    const performancePromises = departmentIds.map(async id => {
      perform.push(await performance(id));
    });

    await Promise.all(reportPromises);
    await Promise.all(performancePromises);

    res.status(200).json({
      status: 'success',
      data: {
        vivaStatus: {
          done: done.length,
          pending: pending.length
        },
        reportStatus: rprtStatus,
        performance: perform
      }
    });
  }),

  updateMe: catchAsync(async (req, res, next) => {
    // 1) Create error if staff POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updatePassword.',
          400
        )
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated like role and only allow the following
    const filteredBody = filterObj(
      req.body,
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'photo'
    );

    // 3) Update Staff document
    const staff = await Staff.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { staff }
    });
  }),

  deactivateMe: catchAsync(async (req, res, next) => {
    await Staff.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  }),

  // Staff Report controllers

  getReport: catchAsync(async (req, res, next) => {
    const reports = await Report.find({
      examiner: req.params.id,
      status: { $ne: 'notSubmitted' }
    }).populate({
      path: 'student'
    });

    //TODO: Implement sorts and filters for this query

    res.status(200).json({
      status: 'success',
      reports
    });
  }),

  receiveReport: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id).select('status');

    if (!report) {
      return next(new AppError('could not find a report with that ID', 404));
    }

    if (report.status !== 'submitted') {
      return next(new AppError('report already received', 400));
    }

    report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'withExaminer', receivedAt: Date.now() },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      report: report
    });
  }),

  clearReport: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id).select('status');

    if (!report) {
      return next(new AppError('could not find a report with that ID', 404));
    }

    if (report.status === 'submitted') {
      return next(new AppError('acknowledge receipt of report first', 400));
    }

    if (
      report.status === 'clearedByExaminer' ||
      report.status === 'vivaDateSet' ||
      report.status === 'vivaComplete' ||
      report.status === 'pendingRevision' ||
      report.status === 'complete'
    ) {
      return next(new AppError('report already cleared', 400));
    }

    const filteredBody = filterObj(req.body, 'examinerScore');

    if (!Object.prototype.hasOwnProperty.call(filteredBody, 'examinerScore')) {
      return next(
        new AppError('please provide a score for the report before clearing it', 400)
      );
    }

    filteredBody.status = 'clearedByExaminer';
    filteredBody.examinerScoreDate = Date.now();
    // TODO: Add examinerGrade based on Standard Grading System

    report = await Report.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      report: report
    });
  }),

  assignExaminer: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id).select('status examiner');

    // only assign examiner for report that has been submitted
    if (report.status === 'notSubmitted') {
      return next(new AppError('cannot assign examiner to unsubmitted report', 400));
    }

    const filteredBody = filterObj(req.body, 'examiner');

    report = await Report.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      report: report
    });
  }),

  setVivaDate: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id).select(
      'status examinerScore examinerScoreDate'
    );

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
    filteredBody.status = 'vivaDateSet';

    report = await Report.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      report: report
    });
  }),

  setVivaScore: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id).select('status vivaDate');

    if (report.status !== 'vivaDateSet') {
      return next(
        new AppError(
          'Cannot set viva score for report without viva date. Please set a viva date and update score',
          400
        )
      );
    }

    const filteredBody = filterObj(req.body, 'vivaScore');
    filteredBody.vivaScoreDate = Date.now();
    filteredBody.status = 'complete';

    report = await Report.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      report: report
    });
  })
};
