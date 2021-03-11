const { Staff, Principal, Dean } = require('../models/staff');
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

  getAllDeans: catchAsync(async (req, res, next) => {
    const deans = await Principal.getALLDeans();

    res.status(200).send(deans);
  }),

  getStaff: catchAsync(async (req, res, next) => {
    const staff = await Staff.findById(req.params.id);

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
    let school;
    const { role } = req.user;

    if (role === 'principal' || role === 'admin') {
      // eslint-disable-next-line prefer-destructuring
      school = req.params.school;
    } else {
      // eslint-disable-next-line prefer-destructuring
      school = req.user.school;
    }

    // find students within that particular school
    const studentIds = await Student.findById(school).distinct('_id');
    const departmentIds = await Department.find({ school }).distinct('_id');

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
      path: 'student',
      populate: [{ path: 'program', select: 'name -_id' }]
    });

    //TODO: Implement sorts and filters for this query

    res.status(200).json({
      status: 'success',
      reports
    });
  })
};
