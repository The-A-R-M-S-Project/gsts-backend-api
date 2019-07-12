const express = require('express');
const controller = require('../controllers/admin');
const { validateToken } = require('../_helpers/auth-utils');

const router = express.Router();

router.route('/').post(controller.add);
router.route('/login').post(controller.login);
router
  .route('/:id')
  .get(validateToken, controller.getById)
  .put(validateToken, controller.update);

module.exports = router;
