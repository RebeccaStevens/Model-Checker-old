'use strict';

/**
 * Serve the files locally - create a local server
 */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var path = require('path');
var browserSync = require('browser-sync');
var historyApiFallback = require('connect-history-api-fallback');
var inject = require('gulp-inject');

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
 * Watch files for changes & reload
 */
gulp.task('serve', ['partials', 'styles', 'elements', 'scripts:es6', 'watch'], function() {
  browserSync({
    port: 5000,
    notify: false,
    snippetOptions: {
      rule: {
        match: '<!-- browser-sync-binding -->',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    // https: true,
    server: {
      baseDir: [temp(), 'app'],
      middleware: [historyApiFallback()]
    }
  });

});

/**
 * Build and serve the output from the dist build
 */
gulp.task('serve:dist', function() {
  browserSync({
    port: 5001,
    notify: false,
    // https: true,
    server: dist(),
    middleware: [historyApiFallback()]
  });
});
