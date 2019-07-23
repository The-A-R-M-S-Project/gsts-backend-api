const Examiner = require('../models/examiners');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

module.exports = {
  getAllExaminers: catchAsync(async (req, res, next) => {
    const examiners = await Examiner.find({});

    res.status(200).send(examiners);
  }),

  getExaminer: catchAsync(async (req, res, next) => {
    const examiner = await Examiner.findById(req.params.id).populate('students');

    if (!examiner) {
      return next(new AppError('No examiner found with that id', 404));
    }
    res.status(200).send(examiner);
  }),

  addExaminer: catchAsync(async (req, res, next) => {
    const examiner = await Examiner.create(req.body);

    res.status(201).json({ examiner, message: 'Examiner successfully added!' });
  }),

  updateExaminer: catchAsync(async (req, res, next) => {
    const examiner = await Examiner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!examiner) {
      return next(new AppError('No examiner found with that id', 404));
    }
    res.json({ message: 'Examiner information updated!', examiner });
  }),

  updateMe: catchAsync(async (req, res, next) => {
    // 1) Create error if examiner POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updatePassword.',
          400
        )
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated like role and only allow the following
    const filteredBody = filterObj(
      req.body,
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'photo'
    );

    // 3) Update Examiner document
    const examiner = await Examiner.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { examiner }
    });
  }),

  deactivateMe: catchAsync(async (req, res, next) => {
    await Examiner.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  })
};
