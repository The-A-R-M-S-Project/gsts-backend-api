const express = require('express');
const schoolController = require('../controllers/schools');

const router = express.Router();

router
  .route('/')
  .post(schoolController.createSchool)
  .get(schoolController.getAllSchools);
router
  .route('/:id')
  .get(schoolController.getSchool)
  .patch(schoolController.updateSchool)
  .delete(schoolController.deleteSchool);

router
  .route('/:id/department')
  .get(schoolController.getAllDepartmentsFromSchool);

module.exports = router;
