const gulp = require('gulp');
const header = require('gulp-header');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const lebab = require('gulp-lebab');
const package = require('./package.json');
let banner;

banner = `/*!
 * <%= package.name %>
 * v<%= package.version %> |
 * (c) ${new Date().getFullYear()} <%= package.author %> |
 * <%= package.homepage %>
 */
`;

gulp.task('modernize:js', function () {
  return gulp.src('src/mediabox.js')
    .pipe(lebab())
    .pipe(gulp.dest('src/'));
});

gulp.task('compress:js', function () {
  return gulp.src('src/mediabox.js')
    .pipe(header(banner, {package: package}))
    .pipe(gulp.dest('dist/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(header(banner, {package: package}))
    .pipe(gulp.dest('dist/'));
});

gulp.task('compress:css', function () {
  return gulp.src('src/mediabox.css')
    .pipe(header(banner, {package: package}))
    .pipe(gulp.dest('dist/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/'));
});

gulp.task('watch', function () {
  gulp.watch('src/mediabox.js', ['compress:js']);
  gulp.watch('src/mediabox.css', ['compress:css']);
});

gulp.task('default', gulp.parallel('compress:js', 'compress:css'));
