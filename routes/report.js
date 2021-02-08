const express = require('express');
const controller = require('../controllers/report');
const studentAuth = require('../auth/studentAuth');
const AuthProtector = require('../auth/authProtector');
const upload = require('./../utils/multerStorage')('inline');

const router = express.Router();

router.use(AuthProtector());

router
  .route('/student')
  .all(studentAuth.restrictTo('student'))
  .get(studentAuth.getMe(), controller.getReport)
  .patch(studentAuth.getMe(), upload.single('report'), controller.updateReport);

router.patch(
  '/submit',
  studentAuth.restrictTo('student'),
  upload.single('report'),
  studentAuth.getMe(),
  controller.submitReport
);

router.get(
  '/:id',
  studentAuth.restrictTo('principal', 'examiner'),
  controller.getStudentReport
);

router
  .route('/')
  .get(studentAuth.restrictTo('admin', 'principal', 'dean'), controller.getAllReports)
  .post(studentAuth.restrictTo('student'), studentAuth.getMe(), controller.addReport);

module.exports = router;
