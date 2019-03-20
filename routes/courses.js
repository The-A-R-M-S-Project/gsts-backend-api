const mongoose = require('mongoose');
const Course = require('../models/courses');
const Student = require('../models/students');
const Department = require('../models/departments');

function getCourses(req, res) {
    Department.findOne({_id: req.params.id})
        .populate('courses')
        .exec((err, department) => {
            if (err) res.send(err);
            else {
                res.json(department.courses)
            }
        });
}

function getCourse(req, res) {
    Course.findById({_id: req.params.id})
        .populate('students')
        .exec((err, course) => {
            if (err) res.send(err);
            else {
                res.json(course)
            }
        });
}

module.exports = {getCourses, getCourse};