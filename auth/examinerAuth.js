const AuthController = require('./authController');
const Examiner = require('../models/examiners');

const ExaminerAuth = new AuthController(Examiner);

module.exports = {
  signup: () => ExaminerAuth.signup(),
  login: () => ExaminerAuth.login(),
  logout: () => ExaminerAuth.logout(),
  protect: () => ExaminerAuth.protect(),
  restrictTo: (...roles) => ExaminerAuth.restrictTo(...roles),
  forgotPassword: () => ExaminerAuth.forgotPassword(),
  resetPassword: () => ExaminerAuth.resetPassword(),
  updatePassword: () => ExaminerAuth.updatePassword(),
  getMe: () => ExaminerAuth.getMe()
};
