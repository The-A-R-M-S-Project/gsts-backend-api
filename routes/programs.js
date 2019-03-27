const mongoose = require('mongoose');
const Program = require('../models/programs');
const Department = require('../models/departments');

function getPrograms(req, res) {
    Department.findOne({_id: req.params.id})
        .populate({path: 'programs', select: 'name _id'}).sort({name: 1})
        .exec((err, department) => {
            if (err) res.send(err);
            else {
                res.json({department: department.name, programs: department.programs})
            }
        });
}

function getProgram(req, res) {
    Program.findById({_id: req.params.id})
        .populate({path: 'students', select: 'bioData.name bioData.netID -_id'}).sort({name: 1})
        .exec((err, program) => {
            if (err) res.send(err);
            else {
                res.json(program)
            }
        });
}

module.exports = {getPrograms, getProgram};