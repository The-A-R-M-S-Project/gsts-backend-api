const AWS = require('aws-sdk');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

AWS.config.update({
  secretAccessKey: process.env.DO_SECRET_ACCESS_KEY,
  accessKeyId: process.env.DO_ACCESS_KEY,
  endpoint: process.env.DO_ENDPOINT,
  s3BucketEndpoint: true,
  region: process.env.DO_S3REGION,
  signatureVersion: 'v4'
});

module.exports = new AWS.S3({ signatureVersion: 'v4' });
