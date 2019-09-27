const express = require('express');
const controller = require('../controllers/students');
const authController = require('../auth/studentAuth');
const staffAuth = require('../auth/staffAuth');
const AuthProtector = require('../auth/authProtector');

const router = express.Router();

router.post('/signup', authController.signup());
router.post('/login', authController.login());
router.get('/logout', authController.logout());
router.post('/forgotPassword', authController.forgotPassword());
router.patch('/resetPassword/:token', authController.resetPassword());

router.use(AuthProtector());

router.patch('/updateMe', controller.updateMe);
router.delete('/deactivateMe', controller.deactivateMe);
router.get('/me', authController.getMe(), controller.getStudent);
router.patch('/updatePassword', authController.updatePassword());

router.get('/report', authController.getMe(), controller.getReport);
router.post('/report', authController.getMe(), controller.addReport);
router.patch('/report', authController.getMe(), controller.updateReport);

router.use(staffAuth.restrictTo('admin', 'principal', 'dean'));
router
  .route('/')
  .get(controller.getAllStudents)
  .post(controller.addStudent);
router
  .route('/:id')
  .get(controller.getStudent)
  .patch(controller.updateStudent);

module.exports = router;
