const express = require('express');
const controller = require('../controllers/students');
const authController = require('../auth/studentAuth');
const lecturerAuth = require('../auth/lecturerAuth');

const router = express.Router();

router.post('/signup', authController.signup());
router.post('/login', authController.login());
router.get('/logout', authController.logout());
router.post('/forgotPassword', authController.forgotPassword());
router.patch('/resetPassword/:token', authController.resetPassword());

router.patch('/updateMe', authController.protect(), controller.updateMe);
router.delete('/deactivateMe', authController.protect(), controller.deactivateMe);
router.get(
  '/me',
  authController.protect(),
  authController.getMe(),
  controller.getStudent
);
router.patch(
  '/updatePassword',
  authController.protect(),
  authController.updatePassword()
);

router.use(lecturerAuth.protect(), lecturerAuth.restrictTo('admin', 'principal'));
router
  .route('/')
  .get(controller.getAllStudents)
  .post(controller.addStudent);
router
  .route('/:id')
  .get(controller.getStudent)
  .patch(controller.updateStudent);

module.exports = router;
