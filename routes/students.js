const express = require('express');
const controller = require('../controllers/students');
const authController = require('../auth/studentAuth');

const router = express.Router();

router.post('/signup', authController.signup());
router.post('/login', authController.login());
router.get('/logout', authController.logout());
router.post('/forgotPassword', authController.forgotPassword());
router.patch('/resetPassword/:token', authController.resetPassword());

// Protect all routes after this middleware
router.use(authController.protect());

router.patch('/updateMe', controller.updateMe);
router.delete('/deactivateMe', controller.deactivateMe);
router.get('/me', authController.getMe(), controller.getStudent);
router.patch('/updatePassword', authController.updatePassword());

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
