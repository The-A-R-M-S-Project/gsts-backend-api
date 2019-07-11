const controller = require('../controllers/students');
const validateToken = require('../_helpers/auth-utils').validateToken;

module.exports = (router) => {
    router.route('/student')
        .post(controller.add);
    router.route('/student/login')
        .post(controller.login);
    router.route('/student/:id')
        .get(validateToken(), controller.getById)
        .put(validateToken(), controller.update);
    router.route('/program/:id/student')
        .get(controller.getStudentsFromProgram);
};