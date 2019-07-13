const express = require('express');
const controller = require('../controllers/students');
const authController = require('../auth/studentAuth');

const router = express.Router();

router.post('/signup', authController.signup());
router.post('/login', authController.login());

router.post('/forgotPassword', authController.forgotPassword());
router.patch('/resetPassword/:token', authController.resetPassword());

router.patch(
  '/updatePassword',
  authController.protect(),
  authController.updatePassword()
);

router
  .route('/')
  .get(controller.getAllStudents)
  .post(controller.addStudent);
router
  .route('/:id')
  .get(controller.getStudent)
  .patch(controller.updateStudent);

module.exports = router;
