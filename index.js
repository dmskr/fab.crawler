#!/usr/bin/env node

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const Promise = require('bluebird');
const service = require('./app/service');

const args = minimist(process.argv.slice(2), {
  string: 'csv',            // --csv import.example.csv
  boolean: ['version'],     // --version
  alias: { v: 'version' }
})

if (args.version) {
  console.log(JSON.parse(fs.readFileSync('./package.json').toString()).version);
  process.exit(0);
}

if (!args.csv) {
  console.log('CSV file is required')
}

Promise.promisify(fs.readFile)(path.resolve(args.csv)).then(buffer => {
  const lines = buffer.toString()
    .replace(/\uFEFF/g, '') // remove BOM if present
    .split('\n')
    .filter(line => (line && !line.match(/^OrganizationId/))) // remove header and empty lines
    .map((line, index) => {
      const [organization, record, key, url] = line.split(',').map(l => l.trim());
      return { organization, record, key, url };
    });

  return service.import(lines);
});

