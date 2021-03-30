const School = require('../models/schools');
const Student = require('../models/students');
const Report = require('../models/reports');
const Department = require('../models/departments');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

module.exports = {
  createSchool: catchAsync(async (req, res, next) => {
    const school = await School.create(req.body);

    res.status(201).json({
      message: 'School successfully added!',
      school
    });
  }),

  getSchool: catchAsync(async (req, res, next) => {
    const school = await School.findById(req.params.id);

    if (!school) {
      return next(new AppError('No school found with that ID', 404));
    }

    res.status(200).json(school);
  }),

  getAllDepartmentsFromSchool: catchAsync(async (req, res, next) => {
    const departments = await Department.find({ school: req.params.id });

    if (!departments) {
      return next(new AppError('No departments found under school with that id', 404));
    }

    res.status(200).json({
      departments: departments
    });
  }),

  getAllSchools: catchAsync(async (req, res, next) => {
    const schools = await School.find({}).sort({ name: 1 });

    res.status(200).json(schools);
  }),

  updateSchool: catchAsync(async (req, res, next) => {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!school) {
      return next(new AppError('No school found with that ID', 404));
    }

    res.status(200).json({ message: 'School updated!', school });
  }),

  deleteSchool: catchAsync(async (req, res, next) => {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) {
      return next(new AppError('No school found with that ID', 404));
    }
    res.status(204).json({ message: 'School successfully deleted!' });
  }),

  dashboardStats: catchAsync(async (req, res, next) => {
    // aggregation pipeline for dashboard
    let school;
    const { role } = req.user;

    if (role === 'principal' || role === 'admin') {
      // eslint-disable-next-line prefer-destructuring
      school = req.params.school;
    } else {
      console.log('yeah');
      if (!req.user.school.equals(req.params.school)) {
        return next(
          new AppError('You are trying to access stats for another school', 400)
        );
      }
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
          $or: [{ status: { $eq: 'vivaComplete' } }, { status: { $eq: 'complete' } }]
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
            { status: { $eq: 'assignedToExaminers' } },
            { status: { $eq: 'receivedByExaminers' } },
            { status: { $eq: 'clearedByExaminers' } },
            { status: { $eq: 'vivaDateSet' } }
          ]
        }
      }
    ]);

    const rprtStatus = [];
    const reportPromises = departmentIds.map(async id => {
      rprtStatus.push(await Department.getDepartmentReportStatus(id));
    });

    const perform = [];
    const performancePromises = departmentIds.map(async id => {
      perform.push(await Department.getDepartmentPerformance(id));
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
  })
};
