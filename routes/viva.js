const express = require('express');
const controller = require('../controllers/viva');
const AuthProtector = require('../auth/authProtector');
const authController = require('../auth/staffAuth');

const router = express.Router({ mergeParams: true });

router.use(AuthProtector());

router.get(
  '/staff/getSetVivaDateStudents',
  authController.restrictTo('admin', 'dean', 'secretary'),
  controller.getSetVivaDateStudents
);

router.patch(
  '/staff/vivadate/:id',
  authController.restrictTo('admin', 'dean'),
  controller.setVivaDate
);

router.patch(
  '/staff/vivascore/:id',
  authController.restrictTo('admin', 'dean'),
  controller.setVivaScore
);

router.patch(
  '/staff/addVivaCommitteeMember/:report_id',
  authController.restrictTo('admin', 'dean'),
  controller.addVivaCommitteeMember
);

router.patch(
  '/staff/removeVivaCommitteeMember/:report_id',
  authController.restrictTo('admin', 'dean'),
  controller.removeVivaCommitteeMember
);

module.exports = router;
