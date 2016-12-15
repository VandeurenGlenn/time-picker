'use strict';
const {task, series, src, dest} = require('gulp');
const {readFileSync, writeFileSync} = require('fs');
const browserSync = require('browser-sync');
const {rollup} = require('rollup');
const babel = require('rollup-plugin-babel');
let cache;

let inject = (tasks, cb) => {
  let calls = 0;
  let need = option => {
    console.error(`${option}::undefined`);
  }
  for (let task of tasks) {
    let sources = task.sources || task.src || need('sources');
    calls += 1;
    for (let source of sources) {
      let dest = task.dest || source;
      let file = readFileSync(source).toString();
      file = file.replace(task.tag, task.inject);
      writeFileSync(dest, file);
      if (calls === tasks.length) {
        cb();
      }
    }
  }
}

task('copy:scripts', () => {
  return src(['src/**/*.js', '!src/time-picker.js']).pipe(dest('.tmp'));
});

task('inject:scripts', cb => {
  let scripts = [{
    src: ['src/time-picker.js'],
    tag: '@web-clock-lite',
    inject: readFileSync('./bower_components/web-clock/src/web-clock-lite.js'),
    dest: '.tmp/time-picker.js'
  }]
  return inject(scripts, cb);
});

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

task('copy', series('copy:scripts'));
task('inject', series('inject:scripts'));
task('build', series('copy', 'inject', 'rollup'));
task('serve', series('build', 'browser-sync'));
