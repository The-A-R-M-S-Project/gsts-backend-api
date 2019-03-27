const mongoose = require('mongoose');
const School = require('../models/schools');

/*
 * GET /school route to retrieve all the schools.
 */
function getSchools(req, res) {
    let query = School.find({});
    query.populate({path: 'departments', select: 'name -_id'}).sort({name: 1}).exec((err, schools) => {
        if (err) res.send(err);
        //If no errors, send them back to the client
        res.json(schools);
    });
}


function postSchools(req, res) {
    let newSchool = School(req.body);
    newSchool.save((err, school) => {
        if (err) res.send(err);
        else res.send({message: 'School successfully added!', school: school})
    });
}

function getSchool(req, res) {
    let query = School.findById(req.params.id);
    query.populate({path: 'departments', select: 'name _id'}).sort({name: 1}).exec((err, school) => {
        if (err) res.send(err);
        else res.json(school);
    });
}

function updateSchool(req, res) {
    School.findById(req.params.id, (err, school) => {
        if (err) res.send(err);
        Object.assign(school, req.body).save((err, school) => {
            if (err) res.send(err);
            res.json({message: "School updated!", school})
        })
    });
}

function deleteSchool(req, res) {
    School.deleteOne({_id: req.params.id}, (err, result) => {
        res.json({message: "School successfully deleted!", result});
    });
}

module.exports = {getSchools, postSchools, getSchool, updateSchool, deleteSchool};