const express = require('express');
const multer = require('multer');
const controller = require('../controllers/report');
const authController = require('../auth/studentAuth');
const AuthProtector = require('../auth/authProtector');
const storageEngines = require('./../utils/multerStorage')('inline');

const upload = multer({ storage: storageEngines.localReportStorage });

const router = express.Router();

router.use(AuthProtector());

// Student Report endpoints
router
  .route('/student')
  .all(authController.restrictTo('student'))
  .get(authController.getMe(), controller.getMyReport)
  .patch(authController.getMe(), upload.single('report'), controller.updateMyReport);

router.patch(
  '/submit',
  authController.restrictTo('student'),
  authController.getMe(),
  upload.single('report'),
  controller.submitReport
);

//Staff report endpoints
router.get(
  '/staff',
  authController.restrictTo('admin', 'principal', 'dean', 'examiner'),
  authController.getMe(),
  controller.getExaminerReports
);
router.patch(
  '/staff/receive/:id',
  authController.restrictTo('examiner'),
  controller.receiveReport
);
router.patch(
  '/staff/clear/:id',
  authController.restrictTo('examiner'),
  controller.clearReport
);

router.patch(
  '/staff/examiner/assign/:id',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.assignExaminer
);

// General report endpoints
router.get(
  '/:id',
  authController.restrictTo('principal', 'dean', 'examiner'),
  controller.getStudentReport
);

router
  .route('/')
  .get(authController.restrictTo('admin', 'principal'), controller.getAllReports)
  .post(
    authController.restrictTo('student'),
    authController.getMe(),
    controller.addReport
  );

module.exports = router;
