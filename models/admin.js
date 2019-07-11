const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema(
  {
    bioData: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, unique: true, trim: true },
      phoneNumber: { type: String, trim: true, unique: true }
    },
    password: { type: String, required: true, trim: true },
    role: { type: String }
  }
);

AdminSchema.pre('save', function(next) {
  const admin = this;
  if (!admin.isModified || !admin.isNew) {
    next();
  } else {
    bcrypt.hash(admin.password, 10, function(err, hash) {
      if (err) {
        console.log(`Error hashing password for Admin: ${admin.firstName} ${admin.lastName}`);
        next(err);
      } else {
        admin.password = hash;
        next();
      }
    });
  }
});

module.exports = mongoose.model('admin', AdminSchema);