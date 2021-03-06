const Report = require('../models/reports');
const Comment = require('../models/comments');
const Student = require('../models/students.js');
const ExaminerReport = require('../models/examiner_report');
const ReportAssessment = require('../models/report_assessment');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { Staff } = require('../models/staff');
const principalRequest = require('../utils/principalRequest');

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
  getAllReports: catchAsync(async (req, res, next) => {
    let reports;
    if (req.user.role === 'dean') {
      reports = await Report.getAllDeanReportsWithExaminers(req.user.school);
    } else {
      reports = await Report.getAllReportsWithExaminers();
    }

    res.status(200).json(reports);
  }),

  getMyReport: catchAsync(async (req, res, next) => {
    const report = await Report.getReportWithExaminerViva(req.params.id);

    if (!report) {
      return next(new AppError('No report found with that for that student', 404));
    }

    //Remove examiners from logged-in student report response
    delete report.examiner;

    res.status(200).json(report);
  }),

  getStudentReport: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id).populate({
      path: 'student',
      select: 'firstName lastName school _id'
    });

    if (!report) {
      return next(new AppError('No report found with that id', 404));
    }

    report = await Report.getReportWithExaminerViva(report.student._id);

    //Ensure Dean doesn't make operations to objects belonging to other schools
    if (req.user.role === 'dean') {
      if (!req.user.school.equals(report.student.school)) {
        return next(
          new AppError('Dean Cannot get Report belonging to other schools', 400)
        );
      }
    }

    if (req.user.role === 'examiner') {
      const examinerReport = await ExaminerReport.findOne({
        examiner: req.user._id,
        report: req.params.id
      });

      if (!req.user._id.equals(examinerReport.examiner)) {
        return next(
          new AppError(`Examiner cannot get report that isn't assigned to them`, 400)
        );
      }
    }

    res.status(200).json(report);
  }),

  addReport: catchAsync(async (req, res, next) => {
    let report = await Report.findOne({ student: req.params.id });
    if (report) {
      return next(new AppError('You already have a report, update it instead', 403));
    }

    const filteredBody = filterObj(req.body, 'title', 'abstract');
    filteredBody.student = req.params.id;
    report = new Report(filteredBody);

    await report.save();

    // make sure you do not have password info on this route so that you can update the student document safely
    guaranteeNoPasswordInfo(req, res, next);

    res.status(201).json({
      message: 'Report successfully added',
      report
    });
  }),

  updateMyReport: catchAsync(async (req, res, next) => {
    let report = await Report.findOne({ student: req.params.id });

    if (!report) {
      return next(new AppError('No report found with that for that student', 404));
    }

    if (report.status !== 'notSubmitted') {
      return next(new AppError('Cannot edit already submitted report', 400));
    }

    const filteredBody = filterObj(req.body, 'title', 'abstract');
    filteredBody.updatedAt = Date.now();
    if (req.file) {
      filteredBody.reportURL = req.file.location;
    }

    report = await Report.findByIdAndUpdate(report._id, filteredBody, {
      new: true
    }).populate({
      path: 'student',
      select: 'firstName lastName _id'
    });

    res.status(200).json({ message: 'Report Updated', report });
  }),

  submitReport: catchAsync(async (req, res, next) => {
    let report = await Report.findOne({ student: req.params.id });

    if (!report) {
      return next(new AppError('No report found with that for that student', 404));
    }

    if (report.status !== 'notSubmitted') {
      return next(new AppError('Already submitted report', 400));
    }

    // multer middleware adds a file object to the request including the details about where the file is stored
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    const filteredBody = filterObj(req.body, 'title', 'abstract');
    filteredBody.status = 'submitted';
    filteredBody.submittedAt = req.file.submittedAt;
    filteredBody.reportURL = req.file.location;

    report = await Report.findByIdAndUpdate(report._id, filteredBody, {
      new: true
    }).populate({
      path: 'student',
      select: 'firstName lastName _id'
    });

    // Delete examiners if the retaker resubmits
    if (report.retake === 'yes') {
      await ExaminerReport.deleteMany({ report: report._id });
    }

    res.status(200).json({ status: 'success', message: 'Report Submitted', report });
  }),

  resubmitReport: catchAsync(async (req, res, next) => {
    let report = await Report.findOne({ student: req.params.id });

    if (!report) {
      return next(new AppError('No report found with that for that student', 404));
    }

    if (report.status !== 'resubmit') {
      return next(
        new AppError(
          'Cannot resubmit this report, please contact your principal or dean first',
          400
        )
      );
    }

    // multer middleware adds a file object to the request including the details about where the file is stored
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    const filteredBody = filterObj(req.body, 'title', 'abstract');
    filteredBody.status = 'submitted';
    filteredBody.resubmittedAt = Date.now();
    filteredBody.resubmittedReportURL = req.file.location;

    report = await Report.findByIdAndUpdate(report._id, filteredBody, {
      new: true
    }).populate({
      path: 'student',
      select: 'firstName lastName _id'
    });

    res.status(200).json({ status: 'success', message: 'Report Re-submitted', report });
  }),

  submitFinalReport: catchAsync(async (req, res, next) => {
    const report = await Report.findOne({ student: req.params.id });

    if (!report) {
      return next(new AppError('No report found with that for that student', 404));
    }

    if (report.status === 'complete') {
      return next(new AppError('Already submitted final report', 400));
    }

    if (report.vivaCommitteeReport === undefined) {
      return next(
        new AppError('Cannot submit final report without viva committee report', 400)
      );
    }

    if (!req.files) {
      return next(new AppError('Please upload required files', 400));
    }
    report.status = 'complete';
    report.completedAt = req.files.finalReport[0].finalSubmissionAt;
    report.finalReportURL = req.files.finalReport[0].location;
    report.complainceReportURL = req.files.complainceReport[0].location;

    await report.save();

    // Register student's academic year of completion
    let yearOne = new Date().getFullYear();
    let yearTwo = yearOne - 1;
    const student = await Student.findByIdAndUpdate(req.params.id, {
      exitAcademicYear: `${yearTwo}/${yearOne}`
    }, {new: false});

    res.status(200).json({ status: 'success', message: 'Report Submitted', report });
  }),

  // Staff Report controllers
  getExaminerReports: catchAsync(async (req, res, next) => {
    const reports = await ExaminerReport.find({
      examiner: req.params.id
    })
      .populate({
        path: 'report',
        populate: [
          {
            path: 'student',
            select: 'firstName lastName program department _id',
            populate: [
              { path: 'program', select: 'name -_id' },
              { path: 'department', select: '-name -__v' }
            ]
          }
        ]
      })
      .populate({
        path: 'reportAssessment'
      });

    res.status(200).json({
      status: 'success',
      reports
    });
  }),

  requestResubmitReport: catchAsync(async (req, res, next) => {
    const report = await Report.findById(req.params.id).select('student status');

    if (!report) {
      return next(new AppError('Could not find a report with that ID', 404));
    }

    if (report.status === 'notSubmitted') {
      return next(
        new AppError(
          'Report has not yet been submitted. Cannot complete this action',
          400
        )
      );
    }

    const examinerReports = await ExaminerReport.find({ report: report._id });

    if (
      examinerReports.length > 0 &&
      (report.status === 'submitted' ||
        report.status === 'assignedToExaminers' ||
        report.status === 'receivedByExaminers')
    ) {
      return next(new AppError('The report is already assigned to examiners!', 400));
    }

    report.status = 'resubmit';
    await report.save();

    const filteredBody = filterObj(req.body, 'reason');
    filteredBody.text = `The ${req.user.role} has requested resubmission of this report! Reason: ${filteredBody.reason}`;
    filteredBody.staff = req.user._id;
    filteredBody.student = report.student;
    filteredBody.report = req.params.id;

    const comment = await Comment.create(filteredBody);

    res.status(201).json({
      status: 'success',
      report: report,
      comment: comment
    });
  }),

  uploadVivaCommitteereport: catchAsync(async (req, res, next) => {
    let report = await Report.findById(req.params.id);

    if (!report) {
      return next(new AppError('No report found with that for that student', 404));
    }

    if (report.status !== 'vivaComplete') {
      return next(
        new AppError('cannot upload a report for a viva that is not complete', 400)
      );
    }

    // multer middleware adds a file object to the request including the details about where the file is stored
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    report = await Report.findByIdAndUpdate(
      report._id,
      { vivaCommitteeReport: req.file.location },
      {
        new: true
      }
    ).populate({
      path: 'student',
      select: 'firstName lastName name _id'
    });

    res.status(200).json({ status: 'success', report: report });
  }),

  receiveReport: catchAsync(async (req, res, next) => {
    const report = await Report.findById(req.params.id)
      .select('status examinerInternal student')
      .populate({
        path: 'student'
      });

    if (!report) {
      return next(new AppError('could not find a report with that ID', 404));
    }

    if (report.status === 'notSubmitted') {
      return next(new AppError(`Can't receive a report that is not submitted`, 400));
    }

    let examinerReport = await ExaminerReport.findOne({
      report: req.params.id,
      examiner: req.user._id
    });

    if (!examinerReport) {
      return next(
        new AppError('examiner cannot receive Report that isnt assigned to them', 400)
      );
    }

    if (examinerReport.status !== 'assignedToExaminer') {
      return next(new AppError('report already received', 400));
    }

    examinerReport.status = 'withExaminer';
    examinerReport.receivedAt = Date.now();
    await examinerReport.save();

    const numberOfExaminers = await ExaminerReport.countDocuments({
      report: req.params.id,
      status: 'withExaminer'
    });

    if (numberOfExaminers === 3) {
      report.status = 'receivedByExaminers';
      report.receivedAt = Date.now();
      await report.save();
    }

    examinerReport = await ExaminerReport.findOne({
      report: req.params.id,
      examiner: req.user._id
    })
      .populate({ path: 'report', select: 'status _id title' })
      .populate({ path: 'examiner', select: 'firstName LastName _id' });

    res.status(200).json({
      status: 'success',
      examinerReport: examinerReport
    });
  }),

  rejectReport: catchAsync(async (req, res, next) => {
    const report = await Report.findById(req.params.id)
      .select('status examinerInternal student')
      .populate({
        path: 'student'
      });

    if (!report) {
      return next(new AppError('could not find a report with that ID', 404));
    }

    if (report.status === 'notSubmitted') {
      return next(new AppError(`Can't reject a report that is not submitted`, 400));
    }

    let examinerReport = await ExaminerReport.findOne({
      report: req.params.id,
      examiner: req.user._id
    });

    if (!examinerReport) {
      return next(
        new AppError('examiner cannot reject Report that isnt assigned to them', 400)
      );
    }

    if (examinerReport.status === 'rejectedByExaminer') {
      return next(new AppError('report already rejected, cannot reject twice', 400));
    }

    if (examinerReport.status !== 'assignedToExaminer') {
      return next(new AppError('report already received', 400));
    }

    examinerReport.status = 'rejectedByExaminer';
    examinerReport.rejectionReason = req.body.reason;
    examinerReport.rejectedAt = Date.now();
    await examinerReport.save();

    examinerReport = await ExaminerReport.findOne({
      report: req.params.id,
      examiner: req.user._id
    }).populate({ path: 'report', select: 'status _id title' });

    res.status(200).json({
      status: 'success',
      examinerReport: examinerReport
    });
  }),

  clearReport: catchAsync(async (req, res, next) => {
    const report = await Report.findById(req.params.id).select('status grade finalScore');

    if (!report) {
      return next(new AppError('Could not find a report with that ID', 404));
    }

    let examinerReport = await ExaminerReport.findOne({
      report: req.params.id,
      examiner: req.user._id
    });

    if (!examinerReport) {
      return next(
        new AppError("Examiner cannot clear report that isn't assigned to them", 400)
      );
    }

    if (examinerReport.status === 'assignedToExaminer') {
      return next(
        new AppError('Examiner cannot clear report they did not receive!', 400)
      );
    }

    if (examinerReport.status === 'clearedByExaminer') {
      return next(
        new AppError('Examiner cannot clear report that is already cleared!', 400)
      );
    }

    const filteredBody = filterObj(req.body, 'examinerScore');
    const assessment = filterObj(
      req.body,
      'background',
      'problemStatement',
      'researchMethods',
      'results',
      'discussions',
      'conclusions',
      'recommendations',
      'originality_of_Contribution',
      'literature_Citation',
      'overall_Presentation',
      'corrections'
    );

    if (!Object.prototype.hasOwnProperty.call(filteredBody, 'examinerScore')) {
      return next(
        new AppError('Please provide a score for the report before clearing it', 400)
      );
    }

    let reportAssessment;
    if (!req.file) {
      reportAssessment = await ReportAssessment.create({ assessment: assessment });
    } else {
      reportAssessment = await ReportAssessment.create({
        scannedAsssesmentform: req.file.location
      });
    }

    filteredBody.reportAssessment = reportAssessment;
    filteredBody.status = 'clearedByExaminer';
    filteredBody.examinerScoreDate = Date.now();
    filteredBody.clearedAt = Date.now();

    examinerReport = await ExaminerReport.findOneAndUpdate(
      { examiner: req.user._id, report: req.params.id },
      filteredBody,
      {
        new: true
      }
    );
    const numberOfExaminers = await ExaminerReport.countDocuments({
      report: req.params.id,
      status: 'clearedByExaminer'
    });

    if (numberOfExaminers === 3) {
      report.status = 'clearedByExaminers';
      report.clearedAt = Date.now();
      await report.calculateFinalGrade(); //Will flag a retake if score <60
      await report.save();
    }

    examinerReport = await ExaminerReport.findOne({
      report: req.params.id,
      examiner: req.user._id
    })
      .populate({ path: 'report', select: 'status _id title' })
      .populate({ path: 'examiner', select: 'firstName LastName _id' });

    res.status(200).json({
      status: 'success',
      examinerReport: examinerReport
    });
  }),

  assignExaminer: catchAsync(async (req, res, next) => {
    const report = await Report.findById(req.params.id)
      .select('status examiner student')
      .populate({
        path: 'student'
      });

    if (!report) {
      return next(new AppError('No report found with that id', 404));
    }

    const examiner = await Staff.findById(req.body.examiner);

    if (!examiner) {
      return next(new AppError('could not find a examiner with that ID', 404));
    }

    // only assign examiner for report that has been submitted
    if (report.status === 'notSubmitted') {
      return next(new AppError('cannot assign examiner to unsubmitted report', 400));
    }

    const numberOfInternalExaminers = await ExaminerReport.countDocuments({
      report: req.params.id,
      examinerType: 'internal',
      status: { $in: ['assignedToExaminer', 'withExaminer', 'clearedByExaminer'] }
    });

    const numberOfExternalExaminers = await ExaminerReport.countDocuments({
      report: req.params.id,
      examinerType: 'external',
      status: { $in: ['assignedToExaminer', 'withExaminer', 'clearedByExaminer'] }
    });

    const isExaminerAssignedAsInternal = await ExaminerReport.countDocuments({
      report: req.params.id,
      examiner: req.body.examiner,
      examinerType: 'internal',
      status: { $in: ['assignedToExaminer', 'rejectedByExaminer'] }
    });

    const isExaminerAssignedAsExternal = await ExaminerReport.countDocuments({
      report: req.params.id,
      examiner: req.body.examiner,
      examinerType: 'external',
      status: { $in: ['assignedToExaminer', 'rejectedByExaminer'] }
    });

    const filteredBody = filterObj(req.body, 'examinerType', 'examiner');
    filteredBody.report = req.params.id;
    filteredBody.status = 'assignedToExaminer';
    filteredBody.assignedAt = Date.now();

    let examinerReport;
    // If requested to assign as internal
    if (filteredBody.examinerType === 'internal') {
      // Throw error if trying to assign more than 2 internal examiners
      if (numberOfInternalExaminers > 1) {
        return next(new AppError('Cannot assign more than two internal examiners', 400));
      }

      if (isExaminerAssignedAsExternal) {
        // If examiner already assigned as external, delete their external examiner record...
        await ExaminerReport.deleteOne({
          examinerType: 'external',
          report: filteredBody.report,
          examiner: filteredBody.examiner
        });
        // Register them as an internal examiner on the same report
        examinerReport = await ExaminerReport.findOneAndUpdate(
          {
            examinerType: 'internal',
            report: filteredBody.report,
            examiner: filteredBody.examiner
          },
          { $set: filteredBody },
          { upsert: true, new: true }
        ).populate({ path: 'report', select: 'status _id title' });

        principalRequest.sendExaminerInvitation(examiner);
      } else {
        examinerReport = await ExaminerReport.findOneAndUpdate(
          {
            examinerType: 'internal',
            report: filteredBody.report,
            examiner: filteredBody.examiner
          },
          { $set: filteredBody },
          { upsert: true, new: true }
        ).populate({ path: 'report', select: 'status _id title' });
        principalRequest.sendExaminerInvitation(examiner);
      }
    } else if (filteredBody.examinerType === 'external') {
      if (numberOfExternalExaminers > 0) {
        return next(new AppError('Cannot assign more than one external examiner', 400));
      }
      if (isExaminerAssignedAsInternal) {
        await ExaminerReport.deleteOne({
          examinerType: 'internal',
          report: filteredBody.report,
          examiner: filteredBody.examiner
        });

        examinerReport = await ExaminerReport.findOneAndUpdate(
          {
            examinerType: 'external',
            report: filteredBody.report,
            examiner: filteredBody.examiner
          },
          { $set: filteredBody },
          { upsert: true, new: true }
        ).populate({ path: 'report', select: 'status _id title' });
        principalRequest.sendExaminerInvitation(examiner);
      } else {
        examinerReport = await ExaminerReport.findOneAndUpdate(
          {
            examinerType: 'internal',
            report: filteredBody.report,
            examiner: filteredBody.examiner
          },
          { $set: filteredBody },
          { upsert: true, new: true }
        ).populate({ path: 'report', select: 'status _id title' });
        principalRequest.sendExaminerInvitation(examiner);
      }
    }

    const numberOfExaminers = await ExaminerReport.countDocuments({
      report: req.params.id,
      status: 'assignedToExaminer'
    });

    if (numberOfExaminers === 3) {
      report.assignedAt = Date.now();
      report.status = 'assignedToExaminers';
      await report.save();
    }

    res.status(200).json({
      status: 'success',
      examinerReport: examinerReport
    });
  }),

  inviteExaminer: catchAsync(async (req, res, next) => {
    const report = await Report.findById(req.params.id)
      .select('status examiner student')
      .populate({
        path: 'student'
      });
      
    if (!report) {
      return next(new AppError('No report found with that ID', 404));
    }

    const examiner = await Staff.findById(req.body.examiner);
    console.log("Examiner: ", req.body.examiner);

    if (!examiner) {
      return next(new AppError('could not find a examiner with that ID', 404));
    }

    // Only send invitation for an already submitted report
    if (report.status === 'notSubmitted') {
      return next(new AppError('cannot assign examiner to unsubmitted report', 400));
    }

    const examinerReport = await ExaminerReport.findOne({
      report: req.params.id,
      examiner: req.body.examiner,
      status: 'assignedToExaminer'
    })
      .populate({
        path: 'examiner'
      })
      .populate({
        path: 'report',
        populate: [
          {
            path: 'student'
          }
        ]
      });

    //Ensure examiner is attached to this report and that their status is "assignedToExaminer"
    if (!examinerReport) {
      return next(new AppError("Ensure the examiner has been invited to assess this report and they haven't responded!", 400));
    }

    principalRequest.sendExaminerInvitation(examinerReport.examiner);

    res.status(200).json({
      status: 'success',
      message: 'Invitation successfully sent!'
    });
    
  }),

  removeExaminer: catchAsync(async (req, res, next) => {
    const examinerReport = await ExaminerReport.findOne({
      report: req.params.id,
      examiner: req.params.examinerId,
      status: 'assignedToExaminer'
    })
      .populate({
        path: 'examiner'
      })
      .populate({
        path: 'report',
        populate: [
          {
            path: 'student'
          }
        ]
      });

    if (examinerReport.status !== 'assignedToExaminer') {
      return next(new AppError('Cannot remove examiner who has already responded!', 400));
    }

    examinerReport.status = 'withdrawnFromExaminer';
    await examinerReport.save();

    principalRequest.withdrawExaminerRequest(
      examinerReport.examiner,
      examinerReport.report
    );

    res.status(200).json({
      status: 'success',
      message: 'Examiner withdrawn from report'
    });
  }),

  examinerGetReportstatus: catchAsync(async (req, res, next) => {
    const examinerReports = await ExaminerReport.find({ examiner: req.user._id })
      .populate({ path: 'report', select: 'status _id title' })
      .populate({ path: 'examiner', select: 'firstName lastName school' });

    res.status(200).json({
      status: 'success',
      examinerReports: examinerReports
    });
  }),

  getExaminerReportstatus: catchAsync(async (req, res, next) => {
    const examinerReports = await ExaminerReport.find({ report: req.params.id })
      .populate({ path: 'report', select: 'status _id title' })
      .populate({ path: 'examiner', select: 'firstName lastName school' })
      .populate({ path: 'reportAssessment', select: 'assessment scannedAsssesmentform' });
    res.status(200).json({
      status: 'success',
      examinerReports: examinerReports
    });
  })
};
