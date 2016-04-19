'use strict';

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

// Vulcanize granular configuration
gulp.task('build', function() {
  return gulp.src('app/elements/elements.html')
    .pipe($.vulcanize({
      stripComments: true,
      inlineCss: true,
      inlineScripts: true
    }))
    .pipe($.crisper())
    // .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    // .pipe($.if('*.js', babel()))
    // .pipe($.if('*.js', $.uglify({preserveComments: false})))
    .pipe(gulp.dest(dist('elements')))
    .pipe($.size({title: 'vulcanize'}));
});
