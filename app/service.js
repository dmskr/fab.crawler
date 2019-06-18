const URL = require('url');
const AWS = require('aws-sdk');
const request = require('request');
const Promise = require('bluebird');
const Sequelize = require('sequelize');
const HTTPError = require('httperror');
const Image = require('./image').Image;

const S3 = new AWS.S3({
  region: process.env.S3BUCKET_REGION,
  endpoint: process.env.S3BUCKET_ENDPOINT,
  signatureVersion: 'v4',
});

exports.import = (lines) => {
  return Image.sequelize.sync().then(() => {
    const successes = [];
    const errors = [];
    return Promise.map(lines, (line, index) => {
      return exports.fetch(line)
        .then((image) => {
          return Image.create({
            organization: parseInt(image.organization, 10),
            record: parseInt(image.record, 10),
            key: image.key,
            url: image.url,
            local: image.local,
          });
        })
        .then((result) => {
          const message = `${index}: ${result.key} ${result.record}@${result.organization} uploaded successfully`;
          console.log(message);
          successes.push(message);
        })
        .catch((err) => {
          if (err instanceof URIError) {
            const message = `${index}: ${line.key} ${line.record}@${line.organization} fetch failed due to wrong URL. Details: ${err}: ${line.url}`;
            errors.push(message);
            console.error(message);
            return; 
          }
          if (err instanceof HTTPError) {
            const message = `${index}: ${line.key} ${line.record}@${line.organization} fetch failed with ${err.message.match(/\nStatus.+\r/)[0].replace(/\n/, '')}`;
            errors.push(message);
            console.error(message);
            return;
          }
          throw err; // Unknown error
        });
    }, { concurrency: 3 }).then(() => {
      console.log(''.padEnd(25, '.'));
      console.log(`${successes.length} images imported successfully.`)
      if (errors.length) {
        console.log(`${errors.length} images failed with errors:`);
        errors.forEach(console.error);
      }
    });
  });
}

exports.fetch = (image) => {
  const parsed = URL.parse(image.url);
  if (!parsed.hostname) {
    return Promise.reject(new URIError('Invalid URL'));
  }

  // Using streams to minimize memory footprint
  return new Promise((resolve, reject) => {
    const req = request
      .get(image.url)
      .on('error', reject)
      .on('response', (response) => {
        if (response.statusCode !== 200
          || !response.headers['content-type']
          || !response.headers['content-type'].match(/^image/)
        ) {
          return reject(new HTTPError(req, response, 'Invalid response'));
        }

        const filename = parsed.path.split('/').pop();
        return S3.upload({
          Bucket: process.env.S3_BUCKET,
          Key: [image.organization, image.record, filename].join('/'),
          Body: response,
          ACL: 'bucket-owner-full-control',
        }).promise().then((s3resp) => {
          return resolve(Object.assign({}, image, {
            local: s3resp.Location,
          }));
        }).catch(reject);
      });
  });
};
