const multerS3 = require('multer-s3');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const awsS3 = require('./aws');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Helper function to setup any missing directories
const createMissingDirectories = finalDirectory => {
  if (
    !fs.existsSync('./assets') ||
    !fs.existsSync('./assets/public') ||
    !fs.existsSync('./assets/public/uploads') ||
    !fs.existsSync(`./assets/public/uploads/${finalDirectory}`)
  ) {
    fs.mkdirSync(`./assets/public/uploads/${finalDirectory}`, {
      recursive: true
    });
    return `./assets/public/uploads/${finalDirectory}`;
  }
  return `./assets/public/uploads/${finalDirectory}`;
};

module.exports = contentDisposition => {
  const storage = {
    DOFileStorage: multerS3({
      s3: awsS3,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      contentDisposition,
      bucket: process.env.DO_BUCKET,
      metadata: function(req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function(req, file, cb) {
        cb(null, file.originalname);
      }
    }),
    localReportStorage: multer.diskStorage({
      destination: function(req, file, cb) {
        const finalDirectory = 'reports';
        req.submittedAt = Date.now();
        file.filename = `${req.user.name}-${req.submittedAt}${path.extname(
          file.originalname
        )}`;
        const storagelocation = createMissingDirectories(finalDirectory);
        file.location = `${req.protocol}://${req.headers.host}/static/uploads/${finalDirectory}/${file.filename}`;
        cb(null, storagelocation);
      },
      filename: function(req, file, cb) {
        cb(null, `${file.filename}`);
      }
    }),
    localProfilePictureStorage: multer.diskStorage({
      destination: function(req, file, cb) {
        const finalDirectory = 'profile_pictures';
        const storagelocation = createMissingDirectories(finalDirectory);
        file.location = `${req.protocol}://${req.headers.host}/static/uploads/${finalDirectory}/${file.originalname}`;
        cb(null, storagelocation);
      },
      filename: function(req, file, cb) {
        cb(null, file.originalname);
      }
    }),
    localAssessmentFormStorage: multer.diskStorage({
      destination: function(req, file, cb) {
        const finalDirectory = 'report_assessments';
        const storagelocation = createMissingDirectories(finalDirectory);
        file.location = `${req.protocol}://${req.headers.host}/static/uploads/${finalDirectory}/${file.originalname}`;
        cb(null, storagelocation);
      },
      filename: function(req, file, cb) {
        cb(null, file.originalname);
      }
    }),
    localVivaCommitteeReportStorage: multer.diskStorage({
      destination: function(req, file, cb) {
        const finalDirectory = 'vivaCommitteeReports';
        const storagelocation = createMissingDirectories(finalDirectory);
        file.location = `${req.protocol}://${req.headers.host}/static/uploads/${finalDirectory}/${file.originalname}`;
        cb(null, storagelocation);
      },
      filename: function(req, file, cb) {
        cb(null, file.originalname);
      }
    }),
    localFinalReportStorage: multer.diskStorage({
      destination: function(req, file, cb) {
        const finalReportDirectory = 'finalReport';
        const complainceReportDirectory = 'complainceReport';
        const finalReportStorageLocation = createMissingDirectories(finalReportDirectory);
        const complainceReportStorageLocation = createMissingDirectories(
          complainceReportDirectory
        );

        if (file.fieldname === 'finalReport') {
          file.location = `${req.protocol}://${req.headers.host}/static/uploads/${finalReportDirectory}/${file.originalname}`;
          cb(null, finalReportStorageLocation);
        } else if (file.fieldname === 'complainceReport') {
          file.location = `${req.protocol}://${req.headers.host}/static/uploads/${complainceReportDirectory}/${file.originalname}`;
          cb(null, complainceReportStorageLocation);
        }
      },
      filename: function(req, file, cb) {
        if (file.fieldname === 'finalReport') {
          cb(null, file.originalname);
        } else if (file.fieldname === 'complainceReport') {
          cb(null, file.originalname);
        }
      }
    })
  };
  return storage;
};
