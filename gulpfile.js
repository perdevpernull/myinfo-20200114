'use strict';

var paths = {
    js: [
        './src/js/**/*.js'
    ],
    html: ['./src/html/*.html'],
    css: ['./src/css/*.css'],
    sass: ['./src/sass/*.scss'],
    readme: ['README.md'],
    dest: {
        build: './build/',
        dev: './dev/'
    }
};

const packageJson = require('./package.json');
const packageName = packageJson.name;
const main = packageJson.main;

/* ------------------------------------- */
const fs = require('fs');

const gulp = require('gulp');
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const eslint = require('gulp-eslint');

/* ------------------------------------- */

gulp.task('lint', () => {
    return gulp.src(paths.js)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('js-dev', ['lint'], () => {
    return gulp.src(paths.js)
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(concat("bundle.js"))
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(paths.dest.build));
});

gulp.task("default", ['js-dev']);