const schools = require('./schools');
const departments = require('./departments');
const programs = require('./programs');
const students = require('./students');

module.exports = (router) => {
    schools(router);
    departments(router);
    programs(router);
    students(router);
    return router;
};