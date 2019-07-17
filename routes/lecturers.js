const express = require('express');
const controller = require('../controllers/lecturers');
const authController = require('../auth/lecturerAuth');

const router = express.Router();

router.post('/signup', authController.signup());
router.post('/login', authController.login());
router.get('/logout', authController.logout());
router.post('/forgotPassword', authController.forgotPassword());
router.patch('/resetPassword/:token', authController.resetPassword());

router.use(authController.protect());

router.patch('/updateMe', controller.updateMe);
router.delete('/deactivateMe', controller.deactivateMe);
router.get('/me', authController.getMe(), controller.getLecturer);
router.patch('/updatePassword', authController.updatePassword());

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'principal', 'dean'),
    controller.getAllLecturers
  )
  .post(authController.restrictTo('admin'), controller.addLecturer);
router
  .route('/:id')
  .get(authController.restrictTo('admin'), controller.getLecturer)
  .patch(authController.restrictTo('admin', 'dean'), controller.updateLecturer);

module.exports = router;
