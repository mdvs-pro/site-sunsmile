'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var nunjucksRender = require('gulp-nunjucks-render');


gulp.task('sass', function () {
  return gulp.src('./src/sass/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('browser-sync', function () {
  browserSync.init(null, {
    server: {
      baseDir: './'
    }
  });
});

gulp.task('nunjucks', function () {
  // Gets .html and .nunjucks files in pages
  return gulp.src('./src/pages/**/*.+(html|nunjucks)')
    // Renders template with nunjucks
    .pipe(nunjucksRender({
      path: ['./src/templates']
    }))
    // output files in app folder
    .pipe(gulp.dest('.'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('default', ['sass', 'nunjucks', 'browser-sync'], function () {
  gulp.watch('./src/templates/**/*.html', ['nunjucks']);
  gulp.watch('./src/pages/**/*.html', ['nunjucks']);
  gulp.watch('./src/sass/**/*.scss', ['sass']);
  gulp.watch('./index.html', ['bs-reload']);
});