const express = require('express');
const controller = require('../controllers/schools');

const router = express.Router();

router
  .route('/')
  .post(controller.add)
  .get(controller.getAll);
router
  .route('/:id')
  .get(controller.getById)
  .put(controller.update)
  .delete(controller._delete);

router.route('/:id/department').get(controller.getAllDepartmentsFromSchool);

module.exports = router;
