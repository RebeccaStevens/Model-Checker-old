'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var ensureFiles = require('./gulp_tasks/ensure-files.js');
var runSequence = require('run-sequence');

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
require('web-component-tester').gulp.init(gulp);

// Load custom tasks from the `gulp_tasks` directory
try {
  require('require-dir')('gulp_tasks');
} catch (err) {console.error(err);}

// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
  // Uncomment 'cache-config' if you are going to use service workers.
  runSequence(
    ['ensureFiles', 'copy', 'styles'],
    ['elements', 'partials'],
    ['images', 'fonts', 'html'],
    'build', // 'cache-config',
    'watch',
    cb);
});
