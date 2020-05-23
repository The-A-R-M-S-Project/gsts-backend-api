const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const StudentSchema = new mongoose.Schema(
  {
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
        // This only works on CREATE and SAVE!!!
        validator: function(el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!'
      }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date, // will expire after a certain amount of time
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
      enum: ['student'],
      default: 'student'
    },
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    photo: String,
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'program' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'department' },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'school' },
    yearOfStudy: Number,
    report: { type: mongoose.Schema.Types.ObjectId, ref: 'report' }
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function(doc, ret) {
        delete ret.id;
      }
    }
  }
);

StudentSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

StudentSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field and do not save it to DB
  this.passwordConfirm = undefined;
  next();
});

// only set Password modified if one modifies thier password
StudentSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Query middleware that only finds documents with active set ot true
StudentSchema.pre(/^find/, function(next) {
  // 'this' points to the current query
  this.find({ active: { $ne: false } });
  next();
});

StudentSchema.methods.isPasswordCorrect = async function(passwordToCheck, savedPassword) {
  return await bcrypt.compare(passwordToCheck, savedPassword);
};

StudentSchema.methods.isPasswordChangedAfterTokenIssued = function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return jwtTimestamp < changedTimestamp;
  }

  // False means password NOT changed
  return false;
};

StudentSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // saved encrypted reset token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes to expiry

  return resetToken; // return non-encrypted version to send through email
};

module.exports = mongoose.model('student', StudentSchema);
