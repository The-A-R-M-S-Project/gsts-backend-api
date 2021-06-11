const express = require('express');
const multer = require('multer');
const controller = require('../controllers/report');
const authController = require('../auth/studentAuth');
const AuthProtector = require('../auth/authProtector');
const storageEngines = require('./../utils/multerStorage')('inline');

const reportUpload = multer({ storage: storageEngines.localReportStorage });
const reportUpdate = multer({ storage: storageEngines.localReportResubmitStorage });
const assessmentFormUpload = multer({
  storage: storageEngines.localAssessmentFormStorage
});

const vivaCommitteeReportUpload = multer({
  storage: storageEngines.localVivaCommitteeReportStorage
});

const finalReportUpload = multer({
  storage: storageEngines.localFinalReportStorage
});

const router = express.Router();

router.use(AuthProtector());

// Student Report endpoints
router
  .route('/student')
  .all(authController.restrictTo('student'))
  .get(authController.getMe(), controller.getMyReport)
  .patch(
    authController.getMe(),
    reportUpdate.single('report'),
    controller.updateMyReport
  );

router.patch(
  '/submit',
  authController.restrictTo('student'),
  authController.getMe(),
  reportUpload.single('report'),
  controller.submitReport
);

router.patch(
  '/student/submitFinal',
  authController.restrictTo('student'),
  authController.getMe(),
  finalReportUpload.fields([
    { name: 'finalReport', maxCount: 1 },
    { name: 'complainceReport', maxCount: 1 }
  ]),
  controller.submitFinalReport
);

//Staff report endpoints
router.get(
  '/staff',
  authController.restrictTo('examiner'),
  authController.getMe(),
  controller.getExaminerReports
);

router.patch(
  '/staff/receive/:id',
  authController.restrictTo('examiner'),
  controller.receiveReport
);

router.patch(
  '/staff/reject/:id',
  authController.restrictTo('examiner'),
  controller.rejectReport
);

router.patch(
  '/staff/clear/:id',
  authController.restrictTo('examiner'),
  assessmentFormUpload.single('scannedAsssesmentform'),
  controller.clearReport
);

router.patch(
  '/staff/uploadVivaCommitteereport/:id',
  authController.restrictTo('dean', 'secretary'),
  vivaCommitteeReportUpload.single('vivaCommitteeReport'),
  controller.uploadVivaCommitteereport
);

router.patch(
  '/staff/student/resubmit/:id',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.resubmitReport
);

router.patch(
  '/staff/examiner/assign/:id',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.assignExaminer
);

router.delete(
  '/staff/examiner/remove/:id/:examinerId',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.removeExaminer
);
router.get(
  '/staff/examiner/status',
  authController.restrictTo('examiner'),
  controller.examinerGetReportstatus
);

router.get(
  '/staff/examiner/status/:id',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.getExaminerReportstatus
);

// General report endpoints
router.get(
  '/:id',
  authController.restrictTo('principal', 'dean', 'examiner'),
  controller.getStudentReport
);

router
  .route('/')
  .get(authController.restrictTo('admin', 'principal', 'dean'), controller.getAllReports)
  .post(
    authController.restrictTo('student'),
    authController.getMe(),
    controller.addReport
  );

module.exports = router;
