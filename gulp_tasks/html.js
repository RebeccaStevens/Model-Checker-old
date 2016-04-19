'use strict';

// Scan Your HTML For Assets & Optimize Them
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

var optimizeHtmlTask = function(src, dest) {
  var assets = $.useref.assets({
    searchPath: [temp(), 'app']
  });

  return gulp.src(src)
    .pipe(assets)
    // Concatenate and minify JavaScript
    .pipe($.if('*.js', $.uglify({
      preserveComments: 'some'
    })))
    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.cssnano()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Minify any HTML
    // .pipe($.if('*.html', $.htmlmin({
    //   collapseWhitespace: true
    // })))
    // Output files
    .pipe(gulp.dest(dest))
    .pipe($.size({
      title: 'html'
    }));
};

// Scan your HTML for assets & optimize them
gulp.task('html', function() {
  return optimizeHtmlTask(
    ['app/**/*.html', '!app/{elements,test,bower_components}/**/*.html'],
    dist());
});
