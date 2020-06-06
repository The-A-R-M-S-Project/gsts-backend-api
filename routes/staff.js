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
router.get(
  '/dashboard-stats/:school',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.dashboardStats
);

// dean should only see stats for their school
router.get(
  '/dashboard-stats/',
  authController.restrictTo('dean'),
  controller.dashboardStats
);

router.patch('/updateMe', controller.updateMe);
router.delete('/deactivateMe', controller.deactivateMe);
router.get('/me', authController.getMe(), controller.getStaff);
router.patch('/updatePassword', authController.updatePassword());

router.get('/report', authController.getMe(), controller.getReport);
router.patch('/report/receive/:id', controller.receiveReport);
router.patch('/report/clear/:id', controller.clearReport);
router.patch(
  '/report/vivadate/:id',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.setVivaDate
);
router.patch(
  '/report/vivascore/:id',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.setVivaScore
);
router.patch(
  '/report/examiner/assign/:id',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.assignExaminer
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
