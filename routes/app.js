const schools = require('./schools');
const departments = require('./departments');

module.exports = (router) => {
    schools(router);
    departments(router);
    return router;
};