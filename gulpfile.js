'use strict';
const {task, series, src, dest} = require('gulp');
const {readFileSync, writeFileSync} = require('fs');
const browserSync = require('browser-sync');
const {rollup} = require('rollup');
const babel = require('rollup-plugin-babel');
let cache;

task('rollup', () => {
  return rollup({
    entry: 'src/time-picker.js',
    cache: cache
  }).then(bundle => {
    cache = bundle;
    bundle.write({
      dest: 'dist/time-picker.js',
      format: 'cjs',
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

task('build', series('rollup'));
task('serve', series('build', 'browser-sync'));
