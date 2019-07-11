const mongoose = require('mongoose');
const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
  add: (req, res) => {
    let result = {};
    let status = 200;
    let admin = Admin(req.body);
    admin.save((err, admin) => {
      if (!err) {
        result.message = 'Admin successfully added!';
        result.admin = admin;
      } else {
        status = 500;
        result = err;
      }
      res.status(status).send(result);
    });
  },
  login: (req, res) => {
    const { bioData, password } = req.body;

    let result = {};
    let status = 200;
    Admin.findOne({ 'bioData.email': bioData.email }, (err, admin) => {
      if (!err && admin) {
        bcrypt
          .compare(password, admin.password)
          .then(match => {
            if (match) {
              status = 200;
              const payload = {
                user: `${admin.bioData.firstName} ${admin.bioData.lastName}`
              };
              const options = {
                expiresIn: '30m',
                issuer: 'gsts.cedat.mak.ac.ug'
              };
              const secret = process.env.JWT_SECRET;
              result.success = true;
              result.token = jwt.sign(payload, secret, options);
              result.user = {
                name: `${admin.bioData.firstName} ${admin.bioData.lastName}`,
                id: `${admin._id}`
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
  getById: (req, res) => {
    let result = {};
    let status = 200;

    Admin.findById(req.params.id).exec((err, admin) => {
      if (!err) {
        result = admin;
      } else {
        status = 500;
        result = err;
      }
      res.status(status).send(result);
    });
  },
  update: (req, res) => {
    Admin.findById(req.params.id, (err, admin) => {
      if (err) res.send(err);
      Object.assign(admin, req.body).save((err, admin) => {
        if (err) res.send(err);
        res.json({
          message: 'Admin information updated!',
          admin: admin
        });
      });
    });
  }
};
