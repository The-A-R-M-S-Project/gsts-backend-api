const express = require('express');
const controller = require('../controllers/staff');
const AuthProtector = require('../auth/authProtector');
const authController = require('../auth/staffAuth');

const router = express.Router({ mergeParams: true });

router.post('/signup', authController.signup());
router.post('/login', authController.login());
router.get('/logout', authController.logout());
router.post('/forgotPassword', authController.forgotPassword());
router.patch('/resetPassword/:token', authController.resetPassword());

router.use(AuthProtector());

router.patch('/updateMe', controller.updateMe);
router.delete('/deactivateMe', controller.deactivateMe);
router.get('/me', authController.getMe(), controller.getStaff);
router.get('/secretary/:id', controller.getSecretarySchool);
router.patch('/updatePassword', authController.updatePassword());

router.get(
  '/dean-all',
  authController.restrictTo('admin', 'principal'),
  controller.getAllDeans
);

router.patch(
  '/principal/requestReportExaminers/',
  authController.restrictTo('admin', 'principal'),
  controller.requestReportExaminers
);

router.patch(
  '/dean/requestExaminer',
  authController.restrictTo('admin', 'principal'),
  controller.respondToExaminerAssignmentRequest
);

router
  .route('/')
  .get(authController.restrictTo('admin', 'principal', 'dean'), controller.getAllStaff)
  .post(authController.restrictTo('admin'), controller.addStaff);

router
  .route('/:id')
  .get(authController.restrictTo('admin', 'principal'), controller.getStaff)
  .patch(authController.restrictTo('admin', 'principal'), controller.updateStaff);

module.exports = router;
