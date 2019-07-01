const mongoose = require('mongoose');
const School = require('../models/' + 'schools');
const Department = require('../models/' + 'departments');

module.exports = {
    getAllDepartmentsFromSchool: (req, res) => {
        let result = {};
        let status = 200;
        School.findOne({_id: req.params.id})
            .populate({path: 'departments', select: 'name _id'})
            .exec((err, school) => {

                if (!err) {
                    result.school = school.name;
                    result.departments = school.departments;
                } else {
                    status = 500;
                    result = err;
                }
                res.status(status).send(result);
            });
    },
    getAll: (req, res) => {
        let result = {};
        let status = 200;
        let query = Department.find({});
        query.populate({path: 'programs', select: 'name -_id'}).sort({name: 1}).exec((err, departments) => {
            if (!err) {
                result = departments;
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

        Department.findById(req.params.id)
            .populate({path: 'programs', select: 'name -_id'})
            .exec((err, department) => {
                if (!err) {
                    result = department;
                } else {
                    status = 500;
                    result.error = err;
                }
                res.status(status).send(result);

            });
    },
};