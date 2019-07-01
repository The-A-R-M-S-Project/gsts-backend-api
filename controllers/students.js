const mongoose = require('mongoose');
const Program = require("../models/programs");
const Student = require('../models/students');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    login: (req, res) => {
        const {bioData, password} = req.body;

        let result = {};
        let status = 200;
        Student.findOne({'bioData.email': bioData.email}, (err, student) => {
            if (!err && student) {
                bcrypt.compare(password, student.password).then(match => {
                    if (match) {
                        status = 200;
                        // Create a token
                        const payload = {user: `${student.bioData.firstName} ${student.bioData.lastName}`};
                        const options = {expiresIn: '30m', issuer: 'gsts.cedat.mak.ac.ug'};
                        const secret = process.env.JWT_SECRET;
                        result.success = true;
                        result.token = jwt.sign(payload, secret, options);
                    } else {
                        status = 401;
                        result.success = false;
                        result.error = 'Authentication error';
                    }
                    res.status(status).send(result);
                }).catch(err => {
                    result = {};
                    status = 500;
                    result.status = status;
                    result.error = err;
                    res.status(status).send(result);
                });
            } else {
                status = 404;
                result.status = status;
                result.error = "User not found";
                res.status(status).send(result);
            }
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