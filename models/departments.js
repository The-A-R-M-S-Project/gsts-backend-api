const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'school' }
});

module.exports = mongoose.model('department', DepartmentSchema);
