const express = require('express');
const controller = require('../controllers/admin');
const AuthProtector = require('../auth/authProtector');
const authController = require('../auth/adminAuth');

const router = express.Router({ mergeParams: true });

router.post('/login', authController.login());
router.get('/logout', authController.logout());
router.post('/forgotPassword', authController.forgotPassword());
router.patch('/resetPassword/:token', authController.resetPassword());

router.use(AuthProtector());
router.use(authController.restrictTo('admin'));

router.patch('/updateMe', controller.updateMe);
router.delete('/deactivateMe', controller.deactivateMe);
router.get('/me', authController.getMe(), controller.getAdmin);
router.patch('/updatePassword', authController.updatePassword());

router
  .route('/')
  .get(controller.getAllAdmins)
  .post(controller.addAdmin);
router
  .route('/:id')
  .get(controller.getAdmin)
  .patch(controller.updateAdmin);

module.exports = router;
