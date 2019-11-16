#!/usr/bin/env node
// @ts-check

'use strict';

const
  path    = require('path'),
  fs      = require('fs'),
  util    = require('util'),
  spawn   = require('child_process').spawn,
  exec    = require('child_process').exec,
  program = require('commander');

// set program info
program
  .version('0.0.7')
  .usage('[options] [<commit>] [--] [<path>...]')
  .option('--cached', 'show diff of staging files')
  .option('--no-index', 'compare two paths on the filesystem')
  .parse(process.argv);

// judge options
const options = ['--patience'];
if (program.cached) {
  options.push('--cached');
}

// instead of using `program.noIndex"
// they call them "negatable boolean and flag|value"
// when using "--no-OPTION" option, the default value of OPTION is false
if (!program.index) {
  options.push('--no-index')
}

// init output file
const realPath = fs.realpathSync(__dirname);
const output = fs.createWriteStream(`${realPath}/dest/diff.js`)
output.write('var lineDiffExample="');

// git diff
const giff = spawn('git', ['diff'].concat(options).concat(program.args));
giff.stdout.on('data', function (data) {
  // encode to JSON to get escaping
  const encoded = JSON.stringify(data.toString());
  // extract the encoded string's contents
  const contents = encoded.slice(1, -1);
  output.write(contents);
});

giff.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

giff.on('exit', function (code) {
  output.end('";', function () {
    console.log(`${realPath}/index.html`);
    exec(`which open && open ${realPath}/index.html`);
  });
});
