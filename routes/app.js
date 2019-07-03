let schools = require('./schools'),
    departments = require('./departments'),
    programs = require('./programs'),
    students = require('./students'),
    lecturers = require('./lecturers'),
    admin = require('./admin');

module.exports = (router) => {
    schools(router);
    departments(router);
    programs(router);
    admin(router);
    students(router);
    lecturers(router);
    return router;
};