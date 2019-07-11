const mongoose = require('mongoose');
const School = require('../models/' + 'schools');
const Department = require('../models/' + 'departments');

module.exports = {
  getAll: (req, res) => {
    let result = {};
    let status = 200;
    let query = Department.find({});
    query.populate({ path: 'programs', select: 'name -_id' }).sort({ name: 1 }).exec((err, departments) => {
      if (!err) {
        result = departments;
      } else {
        status = 500;
        result.error = err;
      }
      res.status(status).send(result);
    });
  },
  getById: (req, res) => {
    let result = {};
    let status = 200;

    Department.findById(req.params.id)
      .populate({ path: 'programs', select: 'name -_id' })
      .exec((err, department) => {
        if (!err) {
          result = department;
        } else {
          status = 500;
          result.error = err;
        }
        res.status(status).send(result);

      });
  },
  getAllProgramsFromDepartment: (req, res) => {
    let result = {};
    let status = 200;
    Department.findOne({ _id: req.params.id })
      .populate({ path: 'programs', select: 'name _id' }).sort({ name: 1 })
      .exec((err, department) => {
        if (!err) {
          result.department = department.name;
          result.programs = department.programs;
        } else {
          status = 500;
          result = err;
        }
        res.status(status).send(result);
      });
  }
};