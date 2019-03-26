const mongoose = require('mongoose');
const Department = require('../models/departments');
const Program = require("../models/programs");
const Student = require('../models/students');

function getStudentsFromProgram(req, res) {
    Program.findOne({_id: req.params.id})
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
        .populate('program')
        .exec((err, student) => {
            if (err) res.send(err);
            else {
                res.json(student);
            }
        });
}

function postStudent(req, res) {
    let newStudent = Student(req.body);
    newStudent.save((err, student) => {
        if (err) res.send(err);
        else res.json({message: 'Student successfully added!', student: student})
    });
}


function updateStudent(req, res) {
    // todo: Use async to wait for findById in order to update student info for test to pass
    Student.findById(req.params.id, (err, student) => {
        if (err) res.send(err);
        Object.assign(student, req.body).save((err, student) => {
            if (err) res.send(err);
            res.json({message: "Student information updated!", student: student})
        })
    });
}

module.exports = {getStudentsFromProgram, getStudent, postStudent, updateStudent};