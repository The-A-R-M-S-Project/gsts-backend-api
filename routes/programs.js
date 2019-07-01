const controller = require('../controllers/programs');

module.exports = (router) => {
    router.route('/program/:id')
        .get(controller.getById);
    router.route('/department/:id/program')
        .get(controller.getAllProgramsFromDepartment);
};