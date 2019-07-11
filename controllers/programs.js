const mongoose = require('mongoose');
const Program = require('../models/programs');

module.exports = {
  getById: (req, res) => {
    let result = {};
    let status = 200;

    Program.findById({ _id: req.params.id })
      .populate({ path: 'students', select: 'bioData.name bioData.email -_id' }).sort({ name: 1 })
      .exec((err, program) => {
        if (!err) {
          result = program;
        } else {
          status = 500;
          result.error = err;
        }
        res.status(status).send(result);
      });
  },
  getStudentsFromProgram: (req, res) => {
    let result = {};
    let status = 200;
    Program.findOne({ _id: req.params.id })
      .populate('students')
      .exec((err, department) => {
        if (!err) {
          result = department.students;
        } else {
          status = 500;
          result = err;
        }
        res.status(status).send(result);
      });
  }
};