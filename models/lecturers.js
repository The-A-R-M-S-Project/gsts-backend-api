const mongoose = require('mongoose');

const LecturerSchema = new mongoose.Schema(
  {
    bioData: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phoneNumber: { type: String, required: true }
    },
    designation: { type: String, default: 'Lecturer' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'department' },
    students: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'student' }
    ],
    isAdministrator: { type: Boolean, required: true }
  }
);

module.exports = mongoose.model('lecturer', LecturerSchema);