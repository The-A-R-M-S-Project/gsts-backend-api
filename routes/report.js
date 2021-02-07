const express = require('express');
const controller = require('../controllers/report');
const studentAuth = require('../auth/studentAuth');
const staffAuth = require('../auth/staffAuth');
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
  studentAuth.getMe(),
  controller.submitReport
);

router
  .route('/')
  .get(staffAuth.restrictTo('admin', 'principal', 'dean'), controller.getAllReports)
  .post(
    studentAuth.restrictTo('student'),
    studentAuth.getMe(),
    upload.single('report'),
    controller.addReport
  );

module.exports = router;
