const express = require('express');
const controller = require('../controllers/departments');

const router = express.Router();

router.route('/').get(controller.getAll);
router.route('/:id').get(controller.getById);
router.route('/:id/program').get(controller.getAllProgramsFromDepartment);

module.exports = router;
