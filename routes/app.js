const schools = require('./schools');

module.exports = (router) => {
    schools(router);
    return router;
};