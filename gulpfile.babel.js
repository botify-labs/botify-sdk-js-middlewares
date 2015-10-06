import gulp from 'gulp';
import bump from 'gulp-bump';
import eslint from 'gulp-eslint';
import shell from 'gulp-shell';
import runSequence from 'run-sequence';
import strftime from 'strftime';

import webpackBuild from './webpack/build';


const runEslint = () => {
  return gulp.src([
    '**/*.js',
  ])
  .pipe(eslint())
  .pipe(eslint.format());
};

gulp.task('set-ci-environment', () => {
  process.env.CONTINUOUS_INTEGRATION = true; // eslint-disable-line no-undef
});

gulp.task('build', webpackBuild);

gulp.task('eslint', () => {
  return runEslint();
});

gulp.task('eslint-ci', () => {
  return runEslint().pipe(eslint.failAfterError());
});

gulp.task('test-ci', (done) => {
  runSequence('set-ci-environment', 'eslint-ci', 'build', done);
});

gulp.task('bump-version', function() {
  return gulp.src(['package.json'])
    .pipe(bump(argv))
    .pipe(gulp.dest('./'));
});

gulp.task('release', ['dist', 'bump-version'], function() {
  return gulp.src('')
    .pipe(shell([
      'git add -u', // Add modified files (package.json, bower.json, ...)
      'git add -A dist/', // Add all changes in and dist
      'git commit -a -m "Release <%= pkg.version %>"',
      'git tag -a <%= pkg.version %> -m "Release <%= date %> <%= pkg.version %>"',
      'git push origin HEAD',
      'git push origin <%= pkg.version %>',
    ], {
      templateData: {
        pkg: require('./package.json'),
        date: strftime('%Y/%m/%d', new Date()),
      },
    }));
});
