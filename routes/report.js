const express = require('express');
const controller = require('../controllers/report');

const router = express.Router();

router.route('/').get(controller.getAllReports);

module.exports = router;
