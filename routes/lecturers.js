const express = require('express');
const controller = require('../controllers/lecturers');

const router = express.Router();

router.route('/').get(controller.getAllLecturers);
router.route('/:id').get(controller.getLecturer);

module.exports = router;
