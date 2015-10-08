import argv from 'argv';
import gulp from 'gulp';
import bump from 'gulp-bump';
import shell from 'gulp-shell';
import strftime from 'strftime';

import webpackBuild from './webpack/build';


gulp.task('build', webpackBuild);

gulp.task('bump-version', () => {
  return gulp.src(['package.json'])
    .pipe(bump(argv))
    .pipe(gulp.dest('./'));
});

gulp.task('release', ['dist', 'bump-version'], () => {
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
