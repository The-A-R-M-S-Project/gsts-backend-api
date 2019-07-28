const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A school must have a name'],
    unique: true,
    trim: true
  }
});

module.exports = mongoose.model('school', SchoolSchema);
