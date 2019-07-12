const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const StudentSchema = new mongoose.Schema({
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
    required: [true, 'Please confirm your password']
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: function() {
        return validator.isMobilePhone(this.phoneNumber, 'en-UG');
      },
      message: 'Please enter a valid Phone Number (en-UG)'
    }
  },
  photo: String,
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'program' },
  yearOfStudy: Number
});

StudentSchema.pre('save', function(next) {
  const student = this;
  if (!student.isModified || !student.isNew) {
    // don't rehash if it's an old user
    next();
  } else {
    bcrypt.hash(student.password, 10, function(err, hash) {
      if (err) {
        console.log(
          `Error hashing password for user: ${student.firstName} ${student.lastName}`
        );
        next(err);
      } else {
        student.password = hash;
        next();
      }
    });
  }
});

module.exports = mongoose.model('student', StudentSchema);
