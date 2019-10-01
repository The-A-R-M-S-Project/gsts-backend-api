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
router.patch('/updatePassword', authController.updatePassword());

router.get('/report', authController.getMe(), controller.getReport);
router.patch('/report/receive/:id', controller.receiveReport);
router.patch('/report/clear/:id', controller.clearReport);

router
  .route('/')
  .get(authController.restrictTo('admin', 'principal', 'dean'), controller.getAllStaff)
  .post(authController.restrictTo('admin'), controller.addStaff);
router
  .route('/:id')
  .get(authController.restrictTo('admin', 'principal'), controller.getStaff)
  .patch(authController.restrictTo('admin', 'principal'), controller.updateStaff);

module.exports = router;
