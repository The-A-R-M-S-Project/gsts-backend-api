const express = require('express');
const controller = require('../controllers/programs');

const router = express.Router();

router.route('/:id')
    .get(controller.getById);

router.route('/:id/student')
    .get(controller.getStudentsFromProgram);

module.exports = router;