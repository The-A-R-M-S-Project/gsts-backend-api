const express = require('express');
const controller = require('../controllers/schools');
const authController = require('../auth/staffAuth');
const AuthProtector = require('../auth/authProtector');

const router = express.Router({ mergeParams: true });

router.use(AuthProtector());

// dean should only see stats for their school
router.get(
  '/dashboard-stats/:school?',
  authController.restrictTo('admin', 'principal', 'dean'),
  controller.dashboardStats
);

router
  .route('/')
  .post(controller.createSchool)
  .get(controller.getAllSchools);

router
  .route('/:id')
  .get(controller.getSchool)
  .patch(controller.updateSchool)
  .delete(controller.deleteSchool);

router.route('/:id/department').get(controller.getAllDepartmentsFromSchool);

module.exports = router;
