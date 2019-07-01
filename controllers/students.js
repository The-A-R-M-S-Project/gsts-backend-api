const mongoose = require('mongoose');
const Program = require("../models/programs");
const Student = require('../models/students');

module.exports = {
    add: (req, res) => {
        let result = {};
        let status = 200;
        let newStudent = Student(req.body);
        newStudent.save((err, student) => {
            if (!err) {
                result.message = 'Student successfully added!';
                result.student = student;
            } else {
                // console.error('Save error:', err.stack);
                status = 500;
                result = err;
            }
            res.status(status).send(result);
        });
    },
    getStudentsFromProgram: (req, res) => {
        let result = {};
        let status = 200;
        Program.findOne({_id: req.params.id})
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
    },
    getById: (req, res) => {
        let result = {};
        let status = 200;

        Student.findById(req.params.id)
            .populate('program')
            .exec((err, student) => {
                if (!err) {
                    result = student;
                } else {
                    status = 500;
                    result = err;
                }
                res.status(status).send(result);
            });
    },
    update: (req, res) => {
        // todo: Use async to wait for findById in order to update student info for test to pass
        Student.findById(req.params.id, (err, student) => {
            if (err) res.send(err);
            Object.assign(student, req.body).save((err, student) => {
                if (err) res.send(err);
                res.json({message: "Student information updated!", student: student})
            })
        });
    },
};