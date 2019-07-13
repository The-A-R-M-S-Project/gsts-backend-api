const express = require('express');
const controller = require('../controllers/admin');

const router = express.Router();

router.route('/').post(controller.add);
router.route('/login').post(controller.login);
router
  .route('/:id')
  .get(controller.getById)
  .patch(controller.update);

module.exports = router;
