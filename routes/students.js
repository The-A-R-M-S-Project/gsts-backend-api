const mongoose = require('mongoose');
const Department = require('../models/departments');
const Course = require("../models/courses");
const Student = require('../models/students');

function getStudentsFromDepartment(req, res) {
    Course.findOne({_id: req.params.id})
        .populate('students')
        .exec((err, department) => {
            if (err) res.send(err);
            else {
                res.json(department.students);
            }
        });
}


function getStudent(req, res) {
    Student.findById(req.params.id)
        .populate('course')
        .exec((err, student) => {
            if (err) res.send(err);
            else {
                res.json(student);
            }
        });
}


module.exports = {getStudentsFromDepartment, getStudent};