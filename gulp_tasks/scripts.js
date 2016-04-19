'use strict';

/**
 * Process scripts.
 */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var path = require('path');
var babel = require('gulp-babel');

// the dist/temp functions should all be the same in all gulp task files
var DIST = 'dist';
var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};
var TEMP = '.tmp';
var temp = function(subpath) {
  return !subpath ? TEMP : path.join(TEMP, subpath);
};

/**
 * Transpile es6 JavaScript to es5
 */
gulp.task('scripts:es6', function() {
  return gulp.src('app/**/*.es6.js')
    .pipe(babel())
    .pipe(gulp.dest(temp()))
    .pipe($.uglify({preserveComments: 'some'}))
    .pipe(gulp.dest(dist()));
});
