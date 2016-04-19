'use strict';

var gulp = require('gulp');
var del = require('del');
var path = require('path');

// the dist/temp/app functions should all be the same in all gulp task files
var DIST = 'dist';
var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};
var TEMP = '.tmp';
var temp = function(subpath) {
  return !subpath ? TEMP : path.join(TEMP, subpath);
};
var APP = 'app';
var app = function(subpath) {
  return !subpath ? APP : path.join(APP, subpath);
};

/**
 * Clean output directories
 */
gulp.task('clean', function() {
  return del([temp(), dist()]);
});
