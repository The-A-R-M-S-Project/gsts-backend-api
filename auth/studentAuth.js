const AuthController = require('./authController');
const Student = require('../models/students');
const catchAsync = require('../utils/catchAsync');

const StudentAuth = new AuthController(Student);

module.exports = {
  signup: () => catchAsync(StudentAuth.signup()),
  login: () => catchAsync(StudentAuth.login()),
  protect: () => catchAsync(StudentAuth.protect()),
  restrictTo: (...roles) => StudentAuth.restrictTo(...roles),
  forgotPassword: () => catchAsync(StudentAuth.forgotPassword()),
  resetPassword: () => catchAsync(StudentAuth.resetPassword())
};
