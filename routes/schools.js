const mongoose = require('mongoose');
const School = require('../models/schools');

/*
 * GET /school route to retrieve all the schools.
 */
function getSchools(req, res) {
    let query = School.find({});
    query.exec((err, books) => {
        if (err) res.send(err);
        //If no errors, send them back to the client
        res.json(books);
    });
}

module.exports = {getSchools};