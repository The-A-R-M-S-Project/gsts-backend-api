const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    programs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'program'
      }
    ]
  }
);

module.exports = mongoose.model('department', DepartmentSchema);