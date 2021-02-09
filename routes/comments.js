const express = require('express');
const controller = require('../controllers/comments');
const AuthProtector = require('../auth/authProtector');
const staffAuth = require('../auth/staffAuth');

const router = express.Router({ mergeParams: true });

router.use(AuthProtector());

router
  .route('/report/:reportId')
  .get(controller.getALlReportComments)
  .post(
    staffAuth.restrictTo('examiner', 'dean', 'principal'),
    staffAuth.getMe(),
    controller.addComment
  );

router.patch(
  '/:id',
  staffAuth.restrictTo('examiner', 'dean', 'principal'),
  controller.updateComment
);

router
  .route('/')
  .all(staffAuth.restrictTo('examiner', 'dean', 'principal'))
  .get(controller.getAllComments);

module.exports = router;
