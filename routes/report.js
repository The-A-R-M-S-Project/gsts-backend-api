const express = require('express');
const controller = require('../controllers/report');
const staffAuth = require('../auth/staffAuth');
const AuthProtector = require('../auth/authProtector');

const router = express.Router();

router.use(AuthProtector());
router.use(staffAuth.restrictTo('admin', 'principal', 'dean'));
router.route('/').get(controller.getAllReports);

module.exports = router;
