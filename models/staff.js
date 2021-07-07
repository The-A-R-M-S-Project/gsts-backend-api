const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const Student = require('./students');

const StaffSchema = new mongoose.Schema(
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
      required: true,
      enum: ['admin', 'principal', 'dean', 'examiner', 'secretary']
    },
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'department' },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'school' },
    photo: String
  },
  {
    discriminatorKey: 'role',
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function(doc, ret) {
        delete ret.id;
      }
    }
  }
);

StaffSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

StaffSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field and do not save it to DB
  this.passwordConfirm = undefined;
  next();
});

// only set Password modified if one modifies thier password
StaffSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Query middleware that only finds documents with active set ot true
StaffSchema.pre(/^find/, function(next) {
  // 'this' points to the current query
  this.find({ active: { $ne: false } });
  next();
});

StaffSchema.methods.isPasswordCorrect = async function(passwordToCheck, savedPassword) {
  return await bcrypt.compare(passwordToCheck, savedPassword);
};

StaffSchema.methods.isPasswordChangedAfterTokenIssued = function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return jwtTimestamp < changedTimestamp;
  }
  return false;
};
StaffSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // saved encrypted reset token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes to expiry

  return resetToken; // return non-encrypted version to send through email
};

const Staff = mongoose.model('staff', StaffSchema);

const PrincipalSchema = new mongoose.Schema({ college: String });

PrincipalSchema.statics.getALLDeans = async function() {
  const deans = await Staff.find({ role: 'dean' }).lean();

  // eslint-disable-next-line no-restricted-syntax
  for (const dean of deans) {
    // eslint-disable-next-line no-await-in-loop
    const students = await Student.find({ school: dean.school });
    dean.students = students;
  }

  return deans;
};

PrincipalSchema.methods.getALLStudents = function() {
  const students = Student.find({ school: this.school });
};

const Principal = Staff.discriminator('principal', PrincipalSchema, {
  discriminatorKey: 'role'
});

const DeanSchema = new mongoose.Schema({
  principal: { type: mongoose.Schema.Types.ObjectId, ref: 'principal' }
});

DeanSchema.methods.getStudents = async function() {
  const students = await Student.find({ school: this.school }).lean();
  const dean = this.toObject();
  dean.students = students;
  return dean;
};

const Dean = Staff.discriminator('dean', DeanSchema, { discriminatorKey: 'role' });

const Examiner = Staff.discriminator(
  'examiner',
  new mongoose.Schema({
    affiliation: { type: String, required: [true, 'Please provide your affiliation'] }
  }),
  {
    discriminatorKey: 'role'
  }
);

const Secretary = Staff.discriminator(
  'secretary',
  new mongoose.Schema({
    dean: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'dean',
      required: [true, 'Secretary must have a dean']
    }
  }),
  { discriminatorKey: 'role' }
);

module.exports = { Staff, Principal, Dean, Examiner, Secretary };
