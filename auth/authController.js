const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
    issuer: process.env.JWT_ISSUER
  });
};

class AuthController {
  constructor(User) {
    this.User = User;
  }

  signup() {
    return async (req, res, next) => {
      const user = await this.User.create(req.body);
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30m',
        issuer: 'gsts.cedat.mak.ac.ug'
      });
      res.status(201).json({
        message: `${user.role} successfully added!`,
        token,
        user
      });
    };
  }

  login() {
    return async (req, res, next) => {
      const { email, password } = req.body;

      // 1) Check if email and password exist
      if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
      }
      // 2) Check if user exists && password is correct
      const user = await this.User.findOne({ email }).select('+password');

      if (!user || !(await user.isPasswordCorrect(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
      }

      const token = signToken(user._id);
      // 3) If everything ok, send token to client
      res.status(201).json({
        success: true,
        token,
        user
      });
    };
  }
}

module.exports = AuthController;
