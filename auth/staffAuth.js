const AuthController = require('./authController');
const { Staff } = require('../models/staff');

const StaffAuth = new AuthController(Staff);

module.exports = {
  signup: () => StaffAuth.signup(),
  login: () => StaffAuth.login(),
  logout: () => StaffAuth.logout(),
  restrictTo: (...roles) => StaffAuth.restrictTo(...roles),
  forgotPassword: () => StaffAuth.forgotPassword(),
  resetPassword: () => StaffAuth.resetPassword(),
  updatePassword: () => StaffAuth.updatePassword(),
  getMe: () => StaffAuth.getMe()
};
