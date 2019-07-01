const controller = require('../controllers/departments');

module.exports = (router) => {
    router.route('/department')
        .get(controller.getAll);
    router.route('/department/:id')
        .get(controller.getById);
    router.route('/school/:id/department')
        .get(controller.getAllDepartmentsFromSchool);
};