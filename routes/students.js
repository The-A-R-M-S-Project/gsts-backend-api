const controller = require('../controllers/students');

module.exports = (router) => {
    router.route('/student')
        .post(controller.add);
    router.route('/student/:id')
        .get(controller.getById)
        .put(controller.update);
    router.route('/program/:id/student')
        .get(controller.getStudentsFromProgram);
};