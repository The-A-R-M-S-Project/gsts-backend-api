const express = require('express');
const controller = require('../controllers/examiners');
const authController = require('../auth/examinerAuth');

const router = express.Router();

router.post('/signup', authController.signup());
router.post('/login', authController.login());
router.get('/logout', authController.logout());
router.post('/forgotPassword', authController.forgotPassword());
router.patch('/resetPassword/:token', authController.resetPassword());

router.use(authController.protect());

router.patch('/updateMe', controller.updateMe);
router.delete('/deactivateMe', controller.deactivateMe);
router.get('/me', authController.getMe(), controller.getExaminer);
router.patch('/updatePassword', authController.updatePassword());

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'principal', 'dean'),
    controller.getAllExaminers
  )
  .post(authController.restrictTo('admin'), controller.addExaminer);
router
  .route('/:id')
  .get(authController.restrictTo('admin', 'principal'), controller.getExaminer)
  .patch(authController.restrictTo('admin', 'principal'), controller.updateExaminer);

module.exports = router;
