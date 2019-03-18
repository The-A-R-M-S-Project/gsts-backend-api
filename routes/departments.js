const mongoose = require('mongoose');
const School = require('../models/schools');


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


module.exports = {getDepartments};