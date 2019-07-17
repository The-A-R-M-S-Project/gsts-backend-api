const AuthController = require('./authController');
const Lecturer = require('../models/lecturers');

const LecturerAuth = new AuthController(Lecturer);

module.exports = {
  signup: () => LecturerAuth.signup(),
  login: () => LecturerAuth.login(),
  logout: () => LecturerAuth.logout(),
  protect: () => LecturerAuth.protect(),
  restrictTo: (...roles) => LecturerAuth.restrictTo(...roles),
  forgotPassword: () => LecturerAuth.forgotPassword(),
  resetPassword: () => LecturerAuth.resetPassword(),
  updatePassword: () => LecturerAuth.updatePassword(),
  getMe: () => LecturerAuth.getMe()
};
