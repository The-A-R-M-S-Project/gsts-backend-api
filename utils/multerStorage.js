const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');

const awsS3 = require('./aws');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

module.exports = contentDisposition => {
  const storage = multerS3({
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
  });
  return multer({ storage: storage });
};
