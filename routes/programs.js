const express = require('express');
const controller = require('../controllers/programs');

const router = express.Router();

router.route('/').get(controller.getAllPrograms);
router.route('/:id').get(controller.getProgram);

router.route('/:id/student').get(controller.getAllStudentsFromProgram);

module.exports = router;
