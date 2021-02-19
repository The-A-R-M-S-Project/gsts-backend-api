const express = require('express');
const controller = require('../controllers/viva');
const AuthProtector = require('../auth/authProtector');
const authController = require('../auth/staffAuth');

const router = express.Router({ mergeParams: true });

router.use(AuthProtector());

router.patch(
  '/staff/vivadate/:id',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.setVivaDate
);
router.patch(
  '/staff/vivascore/:id',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.setVivaScore
);

module.exports = router;
