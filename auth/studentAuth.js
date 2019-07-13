const AuthController = require('./authController');
const Student = require('../models/students');
const catchAsync = require('../utils/catchAsync');

const StudentAuth = new AuthController(Student);

module.exports = {
  signup: () => {
    return catchAsync(StudentAuth.signup());
  },
  login: () => {
    return catchAsync(StudentAuth.login());
  }
};
