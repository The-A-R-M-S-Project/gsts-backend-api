const express = require('express');
const controller = require('../controllers/departments');

const router = express.Router();

router.route('/').get(controller.getAllDepartments);
router.route('/:id').get(controller.getDepartment);
router.route('/:id/program').get(controller.getAllProgramsFromDepartment);

module.exports = router;
