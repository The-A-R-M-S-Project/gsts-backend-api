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
    School.findById(req.params.schoolID, (err, school) => {
        if (err) res.send(err);
        else {
            if (school.departments.indexOf(req.params.id) > -1) {
                Department.findById(req.params.id, (err, department) => {
                    if (err) res.send(err);
                    else res.json(department);
                });
            }
            else res.json({message: `department is not part of ${school.name}`});
        }
    });
}


module.exports = {getDepartments, getDepartment};