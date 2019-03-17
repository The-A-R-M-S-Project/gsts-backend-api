const mongoose = require('mongoose');
const School = require('../models/schools');

/*
 * GET /school route to retrieve all the schools.
 */
function getSchools(req, res) {
    let query = School.find({});
    query.exec((err, schools) => {
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

module.exports = {getSchools, postSchools};