const AuthController = require('./authController');
const Admin = require('../models/admin');

const AdminAuth = new AuthController(Admin);

module.exports = {
  signup: () => AdminAuth.signup(),
  login: () => AdminAuth.login(),
  logout: () => AdminAuth.logout(),
  restrictTo: (...roles) => AdminAuth.restrictTo(...roles),
  forgotPassword: () => AdminAuth.forgotPassword(),
  resetPassword: () => AdminAuth.resetPassword(),
  updatePassword: () => AdminAuth.updatePassword(),
  getMe: () => AdminAuth.getMe()
};
