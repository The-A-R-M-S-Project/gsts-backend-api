const mongoose = require('mongoose');
const School = require('../models/schools');
const Department = require('../models/departments');

function getDepartments(req, res) {
    School.findOne({_id: req.params.id})
        .populate('departments')
        .exec((err, school) => {
            if (err) res.send(err);
            else {
                res.json(school.departments)
            }
        });
}

function getDepartment(req, res) {
    Department.findById(req.params.id, (err, department) => {
        if (err) res.send(err);
        else res.json(department);
    });
}


module.exports = {getDepartments, getDepartment};