const mongoose = require('mongoose');
const Program = require('../models/programs');
const Department = require('../models/' + 'departments');

module.exports = {
    getAllProgramsFromDepartment: (req, res) => {
        let result = {};
        let status = 200;
        Department.findOne({_id: req.params.id})
            .populate({path: 'programs', select: 'name _id'}).sort({name: 1})
            .exec((err, department) => {
                if (!err) {
                    result.department = department.name;
                    result.programs = department.programs;
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

        Program.findById({_id: req.params.id})
            .populate({path: 'students', select: 'bioData.name bioData.netID -_id'}).sort({name: 1})
            .exec((err, program) => {
                if (!err) {
                    result = program;
                } else {
                    status = 500;
                    result.error = err;
                }
                res.status(status).send(result);
            });
    },
};