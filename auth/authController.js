const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('./../utils/email');
const catchAsync = require('../utils/catchAsync');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
    issuer: process.env.JWT_ISSUER
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  //send Token via HttpOnly cookie
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60000),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // only for SSL in production

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

class AuthController {
  constructor(User) {
    this.User = User;
  }

  signup() {
    return catchAsync(async (req, res, next) => {
      let user;
      try {
        if (req.body.role === undefined) {
          return res.status(400).send({
            status: 'fail',
            message: `cannot create a user without a role. Please provide a role`
          });
        }
        if (req.body.role === 'examiner') {
          /* Generate random password again for examiner */
          // Length of password
          let length = 8;
          // Character to mix
          let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
          let result = '';
          for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
          
          req.body.password = result;
          req.body.passwordConfirm = result;

          /* Send email to examiner with their credentials */
          const message = `Hello ${req.body.firstName} ${req.body.lastName}, \n
          Welcome to GSTS (Graduate Student Tracking System)!\n
          You have been registered on the GSTS platform as an examiner.\n\n
          You can log into your dashboard at http://161.35.252.183:8020/ using the following credentials: \n
          Username: ${req.body.email}
          Password: ${req.body.password}\n\n
          You may be invited to assess students' reports so watch out for that email and the notification in your dashboard.\n

          Note: This is an automated email! Please do not reply.\n
          Regards
          `;
          await sendEmail({
            email: req.body.email,
            subject: `Welcome to GSTS!`,
            message: message
          });
        }
        user = await this.User.create(req.body);
        
      } catch (err) {
        // Catch specifically duplicate fields and send details to front-end
        if (err.name === 'MongoError' && err.code === 11000) {
          // extract specific duplicate field
          const duplicateField = err.message.substring(
            err.message.lastIndexOf('index: ') + 7,
            err.message.lastIndexOf('_1')
          );
          return res.status(422).send({
            status: 'fail',
            message: `This ${duplicateField} belongs to an already existing account!`
          });
        }
        return res.status(400).send({
          status: 'fail',
          message: `${err.message}`
        });
      }
      createSendToken(user, 201, res);
    });
  }

  login() {
    return catchAsync(async (req, res, next) => {
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

      createSendToken(user, 200, res);
    });
  }

  getMe() {
    return (req, res, next) => {
      req.params.id = req.user.id;
      next();
    };
  }

  restrictTo(...roles) {
    return (req, res, next) => {
      // roles ['admin', 'student', 'examiner', 'dean', 'principal']
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }

      next();
    };
  }

  forgotPassword() {
    return catchAsync(async (req, res, next) => {
      // 1) Get user based on POSTed email
      const user = await this.User.findOne({ email: req.body.email });
      if (!user) {
        return next(new AppError('There is no user with this email address.', 404));
      }

      // 2) Generate the random reset token
      const resetToken = user.createPasswordResetToken(); // the method does not save to DB, it just updates field
      await user.save({ validateBeforeSave: false }); // persist it db without validation

      // 3) Send it to user's email
      const resetURL = `https://gsts-v2.herokuapp.com/${user.role}/secret/edit?reset_password_token=${resetToken}`;

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
    });
  }

  resetPassword() {
    return catchAsync(async (req, res, next) => {
      // 1) Get user based on the token
      const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      const user = await this.User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() } // token should not have expired
      });

      // 2) If token has not expired, and there is user, set the new password
      if (!user) {
        return next(new AppError('The password reset link expired', 400));
      }
      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      // 3) Saving will call the prehook to Update changedPasswordAt property for the user

      // 4) Log the user in, send JWT
      createSendToken(user, 200, res);
    });
  }

  updatePassword() {
    return catchAsync(async (req, res, next) => {
      // 1) Get user from collection
      const user = await this.User.findById(req.user.id).select('+password');

      // 2) Check if POSTed current password is correct
      if (!(await user.isPasswordCorrect(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong.', 401));
      }

      // 3) If so, update password
      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;
      await user.save();
      // User.findByIdAndUpdate will NOT work as intended!

      // 4) Log user in, send JWT
      createSendToken(user, 200, res);
    });
  }

  logout() {
    return (req, res) => {
      res.cookie('jwt', 'no-auth', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
      });
      res.status(200).json({ status: 'success' });
    };
  }
}

module.exports = AuthController;
