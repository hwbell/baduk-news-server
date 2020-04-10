const fs = require('fs');
const AWS = require('aws-sdk');

// The name of the bucket that you have created
let BUCKET_NAME = process.env.SGF_BUCKET;

const uploadFile = async (file) => {
  console.log(BUCKET_NAME)
  // Load the AWS SDK for Node.js
  var AWS = require('aws-sdk');
  // Set the region 
  AWS.config.update({ region: 'us-east-1' });

  // Create S3 service object
  s3 = new AWS.S3({ apiVersion: '2006-03-01' });

  // fallback to baduk-news bucket if there isn't one given
  if (!BUCKET_NAME) {
    BUCKET_NAME = 'baduk-news'
  }

  // call S3 to retrieve upload file to specified bucket
  var uploadParams = { Bucket: BUCKET_NAME, Key: '', Body: '' };

  // Configure the file stream and obtain the upload parameters
  var fs = require('fs');
  var fileStream = fs.createReadStream(file);
  fileStream.on('error', function (err) {
    console.log('File Error', err);
  });
  uploadParams.Body = fileStream;
  var path = require('path');
  uploadParams.Key = path.basename(file);
  console.log(uploadParams)

  // call S3 to retrieve upload file to specified bucket
  s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } if (data) {
      console.log("Upload Success", data.Location);
    }
  });

};

uploadFile('../testFiles/__go4go_20191216_Gu-Li_Xie-He2.sgf');

module.exports = {
  uploadFile
}