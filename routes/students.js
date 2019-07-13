const express = require('express');
const controller = require('../controllers/students');
const { validateToken } = require('../_helpers/auth-utils');
const authController = require('../auth/studentAuth');

const router = express.Router();

router.post('/signup', authController.signup());
router.post('/login', authController.login());

router
  .route('/')
  .get(controller.getAllStudents)
  .post(controller.addStudent);
router
  .route('/:id')
  .get(validateToken(), controller.getStudent)
  .patch(validateToken(), controller.updateStudent);

module.exports = router;
