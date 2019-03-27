const mongoose = require('mongoose');
const School = require('../models/schools');
const Department = require('../models/departments');

function getDepartmentsFromSchool(req, res) {
    School.findOne({_id: req.params.id})
        .populate({path: 'departments', select: 'name _id'})
        .exec((err, school) => {
            if (err) res.send(err);
            else {
                res.json({school: school.name, departments: school.departments})
            }
        });
}

function getAllDepartments(req, res) {
    let query = Department.find({});
    query.populate({path: 'programs', select: 'name -_id'}).sort({name: 1}).exec((err, departments) => {
        if (err) res.send(err);
        else res.json(departments);
    })
}

function getDepartment(req, res) {
    Department.findById(req.params.id)
        .populate({path: 'programs', select: 'name -_id'})
        .exec((err, department) => {
            if (err) res.send(err);
            else res.json(department);
        });
}


module.exports = {getDepartmentsFromSchool, getDepartment, getAllDepartments};