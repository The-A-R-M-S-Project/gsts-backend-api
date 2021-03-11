const Admin = require('../models/admin');
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
  getAllAdmins: catchAsync(async (req, res, next) => {
    const admin = await Admin.find({});

    res.status(200).send(admin);
  }),

  getAdmin: catchAsync(async (req, res, next) => {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return next(new AppError('No admin found with that id', 404));
    }
    res.status(200).send(admin);
  }),

  addAdmin: catchAsync(async (req, res, next) => {
    const admin = await Admin.create(req.body);

    res.status(201).json({ admin, message: 'admin successfully added!' });
  }),

  updateAdmin: catchAsync(async (req, res, next) => {
    const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!admin) {
      return next(new AppError('No admin found with that id', 404));
    }
    res.json({ message: 'admin information updated!', admin });
  }),

  updateMe: catchAsync(async (req, res, next) => {
    // 1) Create error if admin POSTs password data (there is already a route-controller to handle this)
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
      'phoneNumber'
    );

    // 3) Update admin document
    const admin = await Admin.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { admin }
    });
  }),

  deactivateMe: catchAsync(async (req, res, next) => {
    await Admin.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  })
};
