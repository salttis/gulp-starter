"use strict";

var gulp         = require('gulp')
  , cache        = require('gulp-cache')
  , gutil        = require('gulp-util')
  , sass         = require('gulp-sass')
  , refresh      = require('gulp-livereload')
  , prefix       = require('gulp-autoprefixer')
  , minify       = require('gulp-minify-css')
  , imagemin     = require('gulp-imagemin')
  , uglify       = require('gulp-uglify')
  , clean        = require('gulp-rimraf')
  , tinylr       = require('tiny-lr')
  , express      = require('express')
  , path         = require('path')
  , info         = require('./package.json')
  , lr;

// Configuration

var Config = {
  port: 8080,
  livereload_port: 35729,
  images: {
    compression: 3,
    progressive: true,
    interlaced: true
  }
}

// Paths

var paths = {
  app:   {
    root:   './app',
    js:     './app/js',
    scss:   './app/scss',
    css:    './app/css',
    images: './app/img',
    lib:    './app/lib'
  },
  build: {
    root:   './build',
    js:     './build/js',
    css:    './build/css',
    images: './build/img',
    lib:    './build/lib'
  }
}

// Tasks

gulp.task('styles:dev', function(){
  return gulp.src(paths.app.scss + '/**/*.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(prefix('last 2 version', '> 5%', 'safari 5', 'ie 8', 'ie 7', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(paths.app.css));
});

gulp.task('styles:build', function(){
  return gulp.src(paths.app.scss + '/**/*.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(prefix('last 2 version', '> 5%', 'safari 5', 'ie 8', 'ie 7', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(minify())
    .pipe(gulp.dest(paths.build.css));
})

gulp.task('scripts', function(){
  return gulp.src(paths.app.js + '/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(paths.build.js));
});

gulp.task('images', function(){
  return gulp.src([
      paths.app.images + '/**/*.png',
      paths.app.images + '/**/*.jpg',
      paths.app.images + '/**/*.jpeg',
      paths.app.images + '/**/*.gif'
    ])
    .pipe(cache(imagemin({ optimizationLevel: Config.images.compression, progressive: Config.images.progressive, interlaced: Config.images.interlaced })))
    .pipe(gulp.dest(paths.build.images + '/'));
});

gulp.task('libraries', function(){
  return gulp.src(paths.app.lib + '/**/*')
    .pipe(gulp.dest(paths.build.lib));
});

gulp.task('html', function(){
  return gulp.src([
      paths.app.root + '/**/*.html',
      paths.app.root + '/**/*.htm'
    ])
    .pipe(gulp.dest(paths.build.root));
})

gulp.task('server', function(){
  var server = express()
    .use(express.static(path.resolve(paths.app.root)))
    .listen(Config.port);
  gutil.log('Server listening on port', Config.port);
});

gulp.task('livereload', function(){
  lr = tinylr();
  lr.listen(Config.livereload_port, function(err) {
    if(err) gutil.log('Livereload error:', err);
  })
});

gulp.task('watch', function(){
  gulp.watch(paths.app.scss + '/**/*.scss', ['styles']);
  gulp.watch([
      paths.app.images + '/**/*.png',
      paths.app.images + '/**/*.jpg',
      paths.app.images + '/**/*.jpeg',
      paths.app.images + '/**/*.gif',
      paths.app.css + '/**/*.css',
      paths.app.js + '/**/*.js',
      paths.app.root + '/**/*.html',
      paths.app.root + '/**/*.htm'
    ], function(evt){
    refresh(lr).changed(evt.path);
  })
});

gulp.task('clean', function(){
  return gulp.src([ paths.build.root + '/' ], { read: false })
    .pipe(clean());
});

gulp.task('build', ['clean'], function(){
  return gulp.run('html', 'styles:build', 'scripts', 'images', 'libraries');
});

gulp.task('default', ['server', 'livereload', 'styles:dev', 'watch']);
