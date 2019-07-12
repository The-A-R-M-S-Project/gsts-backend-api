const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A school must have a name'],
    unique: true,
    trim: true
  },
  departments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'department'
    }
  ]
});

module.exports = mongoose.model('school', SchoolSchema);
