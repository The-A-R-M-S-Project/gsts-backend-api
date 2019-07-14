const express = require('express');
const controller = require('../controllers/students');
const authController = require('../auth/studentAuth');

const router = express.Router();

router.post('/signup', authController.signup());
router.post('/login', authController.login());
router.post('/forgotPassword', authController.forgotPassword());
router.patch('/resetPassword/:token', authController.resetPassword());

// Protect all routes after this middleware
router.use(authController.protect());

router.patch('/updateMe', authController.protect(), controller.updateMe);
router.delete('/deactivateMe', authController.protect(), controller.deactivateMe);
router.get('/me', authController.getMe(), controller.getStudent);
router.patch(
  '/updatePassword',
  authController.protect(),
  authController.updatePassword()
);

// TODO: Will restrict these to admin users only
router
  .route('/')
  .get(controller.getAllStudents)
  .post(controller.addStudent);
router
  .route('/:id')
  .get(controller.getStudent)
  .patch(controller.updateStudent);

module.exports = router;
