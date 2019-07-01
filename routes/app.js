const schools = require('./schools');
const departments = require('./departments');
const programs = require('./programs');

module.exports = (router) => {
    schools(router);
    departments(router);
    programs(router);
    return router;
};