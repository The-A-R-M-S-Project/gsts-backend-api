const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/students');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

module.exports = {
  addStudent: catchAsync(async (req, res, next) => {
    const student = await Student.create(req.body);

    res.status(201).json({ student, message: 'Student successfully added!' });
  }),

  //TODO: Refactor this with async block and better auth process so that password comparison doesnot happen here
  login: (req, res) => {
    const { bioData, password } = req.body;

    let result = {};
    let status = 200;
    Student.findOne({ 'bioData.email': bioData.email }, (err, student) => {
      if (!err && student) {
        bcrypt
          .compare(password, student.password)
          .then(match => {
            if (match) {
              status = 200;
              // Create a token
              const payload = {
                user: `${student.bioData.firstName} ${student.bioData.lastName}`
              };
              const options = {
                expiresIn: '30m',
                issuer: 'gsts.cedat.mak.ac.ug'
              };
              const secret = process.env.JWT_SECRET;
              result.success = true;
              result.token = jwt.sign(payload, secret, options);
              result.user = {
                name: `${student.bioData.firstName} ${student.bioData.lastName}`,
                id: `${student._id}`
              };
            } else {
              status = 401;
              result.success = false;
              result.error = 'Authentication error';
            }
            res.status(status).send(result);
          })
          .catch(err => {
            result = {};
            status = 500;
            result.status = status;
            result.error = err;
            res.status(status).send(result);
          });
      } else {
        status = 404;
        result.status = status;
        result.error = 'User not found';
        res.status(status).send(result);
      }
    });
  },

  getStudent: catchAsync(async (req, res, next) => {
    const student = await Student.findById(req.params.id).populate({
      path: 'program',
      select: 'name -_id'
    });
    if (!student) {
      return next(new AppError('No student exists with that id', 404));
    }
    res.status(200).send(student);
  }),

  updateStudent: catchAsync(async (req, res, next) => {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!student) {
      return next(new AppError('No student found with that id', 404));
    }
    res.json({ message: 'Student information updated!', student });
  })
};
