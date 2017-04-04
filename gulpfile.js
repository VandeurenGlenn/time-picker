'use strict';
const {task, series, src, dest} = require('gulp');
const del = require('del');
const {readFileSync, writeFileSync} = require('fs');
const browserSync = require('browser-sync');
const {rollup} = require('rollup');
const babel = require('rollup-plugin-babel');
const ghPages = require('gulp-gh-pages');
let cache;

task('clean', () => {
  return del(['.publish', 'dist', '.tmp'])
});

task('rollup', () => {
  return rollup({
    entry: 'src/time-picker.js',
    cache: cache
  }).then(bundle => {
    cache = bundle;
    bundle.write({
      dest: 'dist/time-picker.js',
      format: 'iife',
      moduleName: 'timePicker',
      plugins: [ babel() ]
    });
  });
});

task('browser-sync', () => {
  const reload = () => {
    return browserSync.reload;
  }

  browserSync.init({
    port: 5000,
    ui: {
     port: 5001
    },
    server: {
     baseDir: ['dist', 'demo']
    }
  });

  browserSync.watch('src/*.js').on('change', series('build', reload()));
  browserSync.watch('demo/*.html').on('change', reload());
});

task('before:gh-pages:demo', cb => {
  let string = readFileSync('demo/index.html').toString();
  string = string.replace('<link', `<base href="/time-picker/">
  <link`);
  writeFileSync('.tmp/index.html', string);
  cb();
});

task('gh-pages:demo', () => {
 return src(['./.tmp/**/*', 'dist/**/*.js'])
   .pipe(ghPages());
});

task('copy:hero', () => {
  return src('**-hero.svg').pipe(dest('.tmp/'))
});

task('gh-pages', series('copy:hero', 'before:gh-pages:demo', 'gh-pages:demo'))

task('build', series('clean', 'rollup'));
task('publish', series('build', 'gh-pages'));
task('serve', series('build', 'browser-sync'));
