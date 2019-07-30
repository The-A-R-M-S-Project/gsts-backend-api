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

router.patch('/updateMe', AuthProtector(), controller.updateMe);
router.delete('/deactivateMe', AuthProtector(), controller.deactivateMe);
router.get('/me', AuthProtector(), authController.getMe(), controller.getStudent);
router.patch('/updatePassword', AuthProtector(), authController.updatePassword());

router.use(AuthProtector(), staffAuth.restrictTo('admin', 'principal', 'dean'));
router
  .route('/')
  .get(controller.getAllStudents)
  .post(controller.addStudent);
router
  .route('/:id')
  .get(controller.getStudent)
  .patch(controller.updateStudent);

module.exports = router;
