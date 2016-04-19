'use strict';

/**
 * Inject partials into the html
 */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var path = require('path');
var inject = require('gulp-inject');
var fs = require('fs');
var merge = require('merge-stream');

// the dist/temp/app functions should all be the same in all gulp task files
var DIST = 'dist';
var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};
var TEMP = '.tmp';
var temp = function(subpath) {
  return !subpath ? TEMP : path.join(TEMP, subpath);
};

/**
 * @param {String} partialsPath - the path to the files within app/
 * @param {String|String[]} srcs - the files sources to use
 * @param {String} partial - the partials the to inject
 */
var partialsTask = function(partialsPath, srcs, partial) {
  return gulp.src(srcs.map(function(src) {
      var tempPath = path.join(temp(), partialsPath, src);
      if (fs.existsSync(tempPath)) {
        return tempPath;
      }
      return path.join('app', partialsPath, src);
    }))
    .pipe(inject(
      gulp.src([path.join('app/partials', partial)]), {
        starttag: '<!-- inject:' + partial + ' -->',
        transform: function(filePath, file) {
          return file.contents.toString('utf8');  // return file contents as string
        }
      }
    ))
    .pipe(gulp.dest(temp(partialsPath)))
    .pipe(gulp.dest(dist(partialsPath)))
    .pipe($.size({title: partialsPath}));
};

/**
 * Inject partials into html files
 */
gulp.task('partials', function() {
  // return merge(
  return partialsTask('', ['index.html'], 'splash.html');  // inject splash.html into index.html
  // );
});
