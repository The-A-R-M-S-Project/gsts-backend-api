const schools = require('./schools');
const departments = require('./departments');
const programs = require('./programs');
const students = require('./students');
const lecturers = require('./lecturers');

module.exports = (router) => {
    schools(router);
    departments(router);
    programs(router);
    students(router);
    lecturers(router);
    return router;
};