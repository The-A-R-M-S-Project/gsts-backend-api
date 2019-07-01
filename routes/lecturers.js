const controller = require('../controllers/lecturers');

module.exports = (router) => {
    router.route('/lecturer')
        .get(controller.getAll);
    router.route('/lecturer/:id')
        .get(controller.getById);
};