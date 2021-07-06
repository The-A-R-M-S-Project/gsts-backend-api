const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const { Staff, Principal, Dean } = require('../models/staff');
const Report = require('../models/reports');
const sendEmail = require('./../utils/email');
const School = require('../models/schools');
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
  getAllStaff: catchAsync(async (req, res, next) => {
    const staff = await Staff.find({});

    res.status(200).send(staff);
  }),

  getAllDeans: catchAsync(async (req, res, next) => {
    const deans = await Principal.getALLDeans();

    res.status(200).send(deans);
  }),

  requestReportExaminers: catchAsync(async (req, res, next) => {
    const dean = await Dean.findOne({ school: req.body.school }).populate({
      path: 'school'
    });

    if (!dean) {
      return next(new AppError('There is no dean for this student\'s school!', 404));
    }

    const report = await Report.findById(req.body.report).populate({
      path: 'student'
    });

    if (!report) {
      return next(new AppError('No report found with that id', 404));
    }

    report.principalRequestedExaminer = true;
    await report.save();

    const pathToFile = path.resolve(__dirname, '../assets/private/principalRequest.pdf');

    const principalRequest = `Dear ${dean.name},

I am kindly requesting you to provide a list of examiners for ${report.student.name} from the ${dean.school.name};

Kind Regards,
Pricipal Cedat.`;

    // 1: Create a document
    const doc = new PDFDocument();

    // 2: Pipe its output somewhere, like to a file or HTTP response
    doc.pipe(fs.createWriteStream(pathToFile));

    // Embed a font, set the font size, and render some text
    doc
      .font('Courier')
      .fontSize(22)
      .text('PRINCIPAL REQUEST FOR LIST OF EXAMINERS TO STUDENT.', 100, 50);

    doc.moveDown();

    // Using a standard PDF font
    doc
      .font('Times-Roman')
      .text(principalRequest)
      .moveDown();

    // Finalize PDF file
    doc.end();

    const attachments = [
      {
        filename: 'principalRequest.pdf',
        path: pathToFile
      }
    ];

    try {
      await sendEmail({
        email: dean.email,
        subject: `Request to assign examiners to students of the ${dean.school.name}`,
        message: principalRequest,
        attachments
      });

      res.status(200).json({
        status: 'success',
        message: `Request sent to the Dean of the ${dean.school.name}`
      });
    } catch (error) {
      return next(
        new AppError('There was an error sending the email. Try again later!'),
        500
      );
    }
  }),

  respondToExaminerAssignmentRequest: catchAsync(async (req, res, next) => {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return next(new AppError('No staff found with that id', 404));
    }
    res.status(200).send(staff);
  }),

  getStaff: catchAsync(async (req, res, next) => {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return next(new AppError('No staff found with that id', 404));
    }
    res.status(200).send(staff);
  }),

  getSecretarySchool: catchAsync(async (req, res, next) => {
    const secretaryDean = await Staff.findById(req.params.id);
    const schoolOfDean = await School.findById(secretaryDean.school);
    res.status(200).json({ message: 'Success', schoolOfDean });
  }),

  addStaff: catchAsync(async (req, res, next) => {
    const staff = await Staff.create(req.body);

    res.status(201).json({ staff, message: 'Staff successfully added!' });
  }),

  updateStaff: catchAsync(async (req, res, next) => {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!staff) {
      return next(new AppError('No staff found with that id', 404));
    }
    res.json({ message: 'Staff information updated!', staff });
  }),

  updateMe: catchAsync(async (req, res, next) => {
    // 1) Create error if staff POSTs password data
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

    // 3) Update Staff document
    const staff = await Staff.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { staff }
    });
  }),

  deactivateMe: catchAsync(async (req, res, next) => {
    await Staff.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  }),

  // Staff Report controllers

  getReport: catchAsync(async (req, res, next) => {
    const reports = await Report.find({
      examiner: req.params.id,
      status: { $ne: 'notSubmitted' }
    }).populate({
      path: 'student',
      populate: [{ path: 'program', select: 'name -_id' }]
    });

    //TODO: Implement sorts and filters for this query

    res.status(200).json({
      status: 'success',
      reports
    });
  })
};
