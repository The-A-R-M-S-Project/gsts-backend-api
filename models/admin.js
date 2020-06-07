const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');

const AdminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please tell us your first name!']
  },
  lastName: {
    type: String,
    required: [true, 'Please tell us your last name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(passConfirm) {
        return passConfirm === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: function(number) {
        return validator.isMobilePhone(number, 'en-UG');
      },
      message: 'Please enter a valid Phone Number (en-UG)'
    }
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

AdminSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field and do not save it to DB
  this.passwordConfirm = undefined;
  next();
});

// only set Password modified if one modifies thier password
AdminSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

AdminSchema.methods.isPasswordCorrect = async function(passwordToCheck, savedPassword) {
  return await bcrypt.compare(passwordToCheck, savedPassword);
};

AdminSchema.methods.isPasswordChangedAfterTokenIssued = function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

AdminSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // saved encrypted reset token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes to expiry

  return resetToken; // return non-encrypted version to send through email
};

module.exports = mongoose.model('admin', AdminSchema);
