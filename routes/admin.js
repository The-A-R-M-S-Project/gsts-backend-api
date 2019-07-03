const controller = require('../controllers/admin');
const validateToken = require('../_helpers/auth-utils').validateToken;

module.exports = (router) => {
    router.route('/admin')
        .post(controller.add);
    router.route('/admin/login')
        .post(controller.login);
    router.route('/admin/:id')
        .get(validateToken, controller.getById)
        .put(validateToken, controller.update);
};