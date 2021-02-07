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

router
  .route('/:id')
  .get(
    staffAuth.restrictTo('admin', 'principal', 'dean', 'examiner'),
    controller.getStudent
  );

router.use(staffAuth.restrictTo('admin', 'principal', 'dean'));
router
  .route('/')
  .get(controller.getAllStudents)
  .post(controller.addStudent);
router.route('/:id').patch(controller.updateStudent);

module.exports = router;
