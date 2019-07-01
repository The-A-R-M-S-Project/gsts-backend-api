const controller = require('../controllers/schools');

module.exports = (router) => {
    router.route('/school')
        .post(controller.add)
        .get(controller.getAll);
    router.route('/school/:id')
        .get(controller.getById)
        .put(controller.update)
        .delete(controller._delete);
};