const mongoose = require('mongoose');
const Lecturer = require("../models/lecturers");

module.exports = {
    getAll: (req, res) => {
        let result = {};
        let status = 200;
        Lecturer.find()
            .populate('department')
            .exec((err, lecturers) => {
                if (!err) {
                    result = lecturers;
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
        Lecturer.findById(req.params.id)
            .populate('students')
            .exec((err, lecturer) => {
                if (!err) {
                    result = lecturer;
                } else {
                    status = 500;
                    result.error = err;
                }
                res.status(status).send(result);
            });
    },
};