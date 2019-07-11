const express = require('express');
const controller = require('../controllers/lecturers');

const router = express.Router();

router.route('/')
    .get(controller.getAll);
router.route('/:id')
    .get(controller.getById);

module.exports = router;