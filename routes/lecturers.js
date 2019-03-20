const mongoose = require('mongoose');
const Lecturer = require("../models/lecturers");
const Department = require('../models/departments');

function getLecturers(req, res) {
    Lecturer.find()
        .populate('department')
        .exec((err, lecturers) => {
            if (err) res.send(err);
            else {
                res.json(lecturers);
            }
        });
}

function getLecturer(req, res) {
    Lecturer.findById(req.params.id)
        .populate('students')
        .exec((err, lecturer) => {
            if (err) res.send(err);
            else {
                res.json(lecturer);
            }
        });
}

module.exports = {getLecturers, getLecturer};
