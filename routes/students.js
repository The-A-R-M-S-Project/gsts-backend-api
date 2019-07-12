const express = require('express');
const controller = require('../controllers/students');
const { validateToken } = require('../_helpers/auth-utils');

const router = express.Router();

router.route('/').post(controller.addStudent);
router.route('/login').post(controller.login);
router
  .route('/:id')
  .get(validateToken(), controller.getStudent)
  .put(validateToken(), controller.updateStudent);

module.exports = router;
