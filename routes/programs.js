const mongoose = require('mongoose');
const Program = require('../models/programs');
const Department = require('../models/departments');

function getPrograms(req, res) {
    Department.findOne({_id: req.params.id})
        .populate('programs')
        .exec((err, department) => {
            if (err) res.send(err);
            else {
                res.json(department.programs)
            }
        });
}

function getProgram(req, res) {
    Program.findById({_id: req.params.id})
        .populate('students')
        .exec((err, program) => {
            if (err) res.send(err);
            else {
                res.json(program)
            }
        });
}

module.exports = {getPrograms, getProgram};