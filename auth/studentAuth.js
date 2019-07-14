const AuthController = require('./authController');
const Student = require('../models/students');

const StudentAuth = new AuthController(Student);

module.exports = {
  signup: () => StudentAuth.signup(),
  login: () => StudentAuth.login(),
  protect: () => StudentAuth.protect(),
  restrictTo: (...roles) => StudentAuth.restrictTo(...roles),
  forgotPassword: () => StudentAuth.forgotPassword(),
  resetPassword: () => StudentAuth.resetPassword(),
  updatePassword: () => StudentAuth.updatePassword(),
  getMe: () => StudentAuth.getMe()
};
