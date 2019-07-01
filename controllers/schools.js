const mongoose = require('mongoose');
const School = require('../models/' + 'schools');

module.exports = {
    add: (req, res) => {
        let result = {};
        let status = 200;
        let newSchool = School(req.body);

        newSchool.save((err, school) => {
            if (!err) {
                result.message = 'School successfully added!';
                result.school = school;
            } else {
                // console.error('Save error:', err.stack);
                status = 500;
                result = err;
            }
            res.status(status).send(result);
        });
    },
    getAll: (req, res) => {
        let result = {};
        let status = 200;
        let query = School.find({});

        query.populate({path: 'departments', select: 'name -_id'}).sort({name: 1}).exec((err, schools) => {
            if (!err) {
                result = schools;
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

        let query = School.findById(req.params.id);
        query.populate({path: 'departments', select: 'name _id'}).sort({name: 1}).exec((err, school) => {
            if (!err) {
                result = school;
            } else {
                status = 500;
                result.error = err;
            }
            res.status(status).send(result);
        });
    },
    update: (req, res) => {
        School.findById(req.params.id, (err, school) => {
            if (err) res.send(err);
            Object.assign(school, req.body).save((err, school) => {
                if (err) res.send(err);
                res.json({message: "School updated!", school})
            })
        });

    },
    _delete: (req, res) => {
        School.deleteOne({_id: req.params.id}, (err, result) => {
            res.json({message: "School successfully deleted!", result});
        });
    },
};