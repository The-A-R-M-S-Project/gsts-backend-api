const express = require('express');
const controller = require('../controllers/report');
const authController = require('../auth/studentAuth');
const AuthProtector = require('../auth/authProtector');
const upload = require('./../utils/multerStorage')('inline');

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
  upload.single('report'),
  authController.getMe(),
  controller.submitReport
);

//Staff report endpoints
router.get('/staff', authController.getMe(), controller.getExaminerReports);
router.patch('/staff/receive/:id', controller.receiveReport);
router.patch('/staff/clear/:id', controller.clearReport);
router.patch(
  '/staff/vivadate/:id',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.setVivaDate
);
router.patch(
  '/staff/vivascore/:id',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.setVivaScore
);
router.patch(
  '/staff/examiner/assign/:id',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.assignExaminer
);

// General report endpoints
router.get(
  '/:id',
  authController.restrictTo('principal', 'examiner'),
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
