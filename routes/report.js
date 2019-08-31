const express = require('express');
const controller = require('../controllers/report');

const router = express.Router();

router
  .route('/')
  .get(controller.getAllReports)
  .post(controller.addReport);
router
  .route('/:id')
  .get(controller.getReport)
  .patch(controller.updateReport);

module.exports = router;
