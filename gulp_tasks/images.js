'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var path = require('path');

// the dist/temp functions should all be the same in all gulp task files
var DIST = 'dist';
var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};
var TEMP = '.tmp';
var temp = function(subpath) {
  return !subpath ? TEMP : path.join(TEMP, subpath);
};

var imageOptimizeTask = function(src, dest) {
  return gulp.src(src)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(dest))
    .pipe($.size({title: 'images'}));
};

// Optimize Images
gulp.task('images', function() {
  return imageOptimizeTask('app/images/**/*', dist('images'));
});
