const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const sendEmail = require('./../utils/email');

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

  protect() {
    return async (req, res, next) => {
      // 1) Getting token and check of it's there
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return next(
          new AppError('You are not logged in! Please log in to get access.', 401)
        );
      }

      // 2) Verification token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      // 3) Check if user still exists
      const currentUser = await this.User.findById(decoded.id);
      if (!currentUser) {
        return next(
          new AppError('The user belonging to this token does no longer exist.', 401)
        );
      }

      // 4) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
          new AppError('User recently changed password! Please log in again.', 401)
        );
      }

      // GRANT ACCESS TO PROTECTED ROUTE
      req.user = currentUser;
      next();
    };
  }

  restrictTo(...roles) {
    return (req, res, next) => {
      // roles ['admin', 'student', 'lecturer', 'dean', 'principal']
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }

      next();
    };
  }

  forgotPassword() {
    return async (req, res, next) => {
      // 1) Get user based on POSTed email
      const user = await this.User.findOne({ email: req.body.email });
      if (!user) {
        return next(new AppError('There is no user with email address.', 404));
      }

      // 2) Generate the random reset token
      const resetToken = user.createPasswordResetToken(); // the method does not save to DB, it just updates field
      console.log({ resetToken });
      await user.save({ validateBeforeSave: false }); // persist it db without validation

      // 3) Send it to user's email
      const resetURL = `${req.protocol}://${req.get('host')}/api/${
        user.role
      }/resetPassword/${resetToken}`;

      const message = `Forgot your password? click here to reset it: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Your password reset token (valid for 10 min)',
          message
        });

        res.status(200).json({
          status: 'success',
          message: 'Token sent to email!'
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
          new AppError('There was an error sending the email. Try again later!'),
          500
        );
      }
    };
  }
}

module.exports = AuthController;
