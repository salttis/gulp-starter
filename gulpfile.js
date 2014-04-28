'use strict';

var gulp         = require('gulp')
  , cache        = require('gulp-cache')
  , gutil        = require('gulp-util')
  , sass         = require('gulp-sass')
  , refresh      = require('gulp-livereload')
  , prefix       = require('gulp-autoprefixer')
  , minifyCss    = require('gulp-minify-css')
  , minifyHtml   = require('gulp-minify-html')
  , imagemin     = require('gulp-imagemin')
  , uglify       = require('gulp-uglify')
  , clean        = require('gulp-rimraf')
  , useref       = require('gulp-useref')
  , filter       = require('gulp-filter')
  , express      = require('express')
  , tinylr       = require('tiny-lr')
  , path         = require('path')
  , opn          = require('opn')
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
  },
  paths: {
    app:   {
      root:   './app',
      js:     './app/js',
      scss:   './app/scss',
      css:    './app/css',
      images: './app/img',
      lib:    './app/lib'
    },
    dist: {
      root:   './dist',
      js:     './dist/js',
      css:    './dist/css',
      images: './dist/img',
      lib:    './dist/lib'
    }
  }
}

// Tasks

gulp.task('styles', function(){
  return gulp.src(Config.paths.app.scss + '/index.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(prefix('last 2 version', '> 5%', 'safari 5', 'ie 8', 'ie 7', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(Config.paths.app.css));
});

gulp.task('images', function(){
  return gulp.src([
      Config.paths.app.images + '/**/*.png',
      Config.paths.app.images + '/**/*.jpg',
      Config.paths.app.images + '/**/*.jpeg',
      Config.paths.app.images + '/**/*.gif'
    ])
    .pipe(cache(imagemin({ optimizationLevel: Config.images.compression, progressive: Config.images.progressive, interlaced: Config.images.interlaced })))
    .pipe(gulp.dest(Config.paths.dist.images + '/'));
});

gulp.task('assets', function(){
  return gulp.src(Config.paths.app.root + '/assets/**/*')
    .pipe(gulp.dest(Config.paths.dist.root + '/assets'));
});

gulp.task('html', function(){
  var jsFilter  = filter('**/*.js')
    , cssFilter = filter('**/*.css')
    , htmlFilter = filter('**/*.html');

  return gulp.src(Config.paths.app.root + '/**/*.html')
    .pipe(useref.assets())
    .pipe(jsFilter)
    .pipe(uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe(minifyCss())
    .pipe(cssFilter.restore())
    .pipe(useref.restore())
    .pipe(useref())
    .pipe(htmlFilter)
    .pipe(minifyHtml())
    .pipe(htmlFilter.restore())
    .pipe(gulp.dest(Config.paths.dist.root));
})

gulp.task('server', function(){
  var server = express()
    .use(express.static(path.resolve(Config.paths.app.root)))
    .listen(Config.port);
  gutil.log('Server listening on port %s', Config.port);
});

gulp.task('livereload', function(){
  lr = tinylr();
  lr.listen(Config.livereload_port, function(err) {
    if(err) gutil.log('Livereload error:', err);
  })
});

gulp.task('watch', function(){
  gulp.watch(Config.paths.app.scss + '/**/*.scss', ['styles']);
  gulp.watch([
      Config.paths.app.images + '/**/*.png',
      Config.paths.app.images + '/**/*.jpg',
      Config.paths.app.images + '/**/*.jpeg',
      Config.paths.app.images + '/**/*.gif',
      Config.paths.app.css + '/**/*.css',
      Config.paths.app.js + '/**/*.js',
      Config.paths.app.root + '/**/*.html'
    ], function(evt){
    refresh(lr).changed(evt.path);
  })
});

gulp.task('clean', function(){
  return gulp.src([ Config.paths.dist.root + '/' ], { read: false })
    .pipe(clean());
});

gulp.task('build', ['clean', 'styles', 'html', 'images']);
gulp.task('default', ['server', 'livereload', 'styles', 'watch'], function(){
  opn('http://localhost:' + Config.port);
});
