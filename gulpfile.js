'use strict';
var argv         = require('minimist')(process.argv.slice(2))
  , gulp         = require('gulp')
  , cache        = require('gulp-cache')
  , watch        = require('gulp-watch')
  , gutil        = require('gulp-util')
  , gulpif       = require('gulp-if')
  , gulpifelse   = require('gulp-if-else')
  , sass         = require('gulp-sass')
  , livereload   = require('gulp-livereload')
  , prefix       = require('gulp-autoprefixer')
  , minifyCss    = require('gulp-minify-css')
  , minifyHtml   = require('gulp-minify-html')
  , imagemin     = require('gulp-imagemin')
  , uglify       = require('gulp-uglify')
  , useref       = require('gulp-useref')
  , filter       = require('gulp-filter')
  , concat       = require('gulp-concat')
  , defineModule = require('gulp-define-module')
  , declare      = require('gulp-declare')
  , handlebars   = require('gulp-handlebars')
  , del          = require('del')
  , express      = require('express')
  , path         = require('path')
  , opn          = require('opn')
  , info         = require('./package.json');

// Configuration

var Config = {
  port: 8080,
  livereload_port: 35729,
  cache: (typeof argv.cache !== 'undefined' ? !!argv.cache : false),
  imagemin: {
    optimizationLevel: 3,
    progressive: true,
    interlaced: true
  },
  paths: {
    app:   {
      root:   'app',
      js:     'app/js',
      scss:   'app/scss',
      css:    'app/css',
      images: 'app/img',
      fonts:  'app/fonts',
      lib:    'app/lib',
      tmpl:   'app/tmpl',
      extra: [
        //'app/foo/**/*',
        //'app/bar/**/*'
      ]
    },
    build: {
      root:   'public',
      js:     'public/js',
      css:    'public/css',
      images: 'public/img',
      fonts:  'public/fonts',
      lib:    'public/lib',
      extra: [
        //'public/foo/',
        //'public/bar/'
      ]
    }
  }
}

// Tasks
// =====

// Styles
gulp.task('styles', function(){
  return gulp.src(Config.paths.app.scss + '/index.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(prefix('last 2 version', '> 5%', 'safari 5', 'ie 8', 'ie 7', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(Config.paths.app.css));
});

// Fonts
gulp.task('fonts:clean', function(next){
  del(Config.paths.build.fonts + '/**', next);
});
gulp.task('fonts', ['fonts:clean'], function(){
  return gulp.src(Config.paths.app.fonts + '/**/*')
    .pipe(gulp.dest(Config.paths.build.fonts + '/'));
});

// Images
gulp.task('images:clean', function(next){
  del(Config.paths.build.images + '/**', next);
});
gulp.task('images', ['images:clean'], function(){
  return gulp.src(Config.paths.app.images + '/**/*')
    .pipe(gulpifelse(
      Config.cache, function(){
        return cache(imagemin(Config.imagemin)) // if
      }, function(){
        return imagemin(Config.imagemin) // else
      }
    ))
    .pipe(gulp.dest(Config.paths.build.images + '/'));
});

// Templates
gulp.task('templates', function(){
  return gulp.src(Config.paths.app.tmpl + '/**/*')
    .pipe(handlebars())
    .pipe(defineModule('plain'))
    .pipe(declare({
      namespace: 'tmpl'
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest(Config.paths.app.js + '/'));
});

// HTML, JavaScript, CSS
gulp.task('html:clean', function(next){
  del([Config.paths.build.root + '/**/*.html', Config.paths.build.root + '/**/*.css', Config.paths.build.root + '/**/*.js'], next);
});
gulp.task('html', ['html:clean'], function(){
  var jsFilter  = filter('**/*.js')
    , cssFilter = filter('**/*.css')
    , htmlFilter = filter('**/*.html');

  var assets = useref.assets();

  return gulp.src([Config.paths.app.root + '/**/*.html', '!' + Config.paths.app.lib + '/**/*'])
    .pipe(assets)
    .pipe(jsFilter)
    .pipe(uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe(minifyCss())
    .pipe(cssFilter.restore())
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(htmlFilter)
    .pipe(minifyHtml())
    .pipe(htmlFilter.restore())
    .pipe(gulp.dest(Config.paths.build.root));
})

// Extra folders
gulp.task('extra:clean', function(next){
  if(!Config.paths.build.extra.length) {
    return;
  }
  del(Config.paths.build.extra + '/**', next);
})
gulp.task('extra', ['extra:clean'], function(){
  if(!Config.paths.app.extra.length || !Config.paths.build.extra.length || Config.paths.app.extra.length != Config.paths.build.extra.length) {
    return;
  }
  for(var dir in Config.paths.app.extra) {
    gulp.src(Config.paths.app.extra[dir])
      .pipe(gulp.dest(Config.paths.build.extra[dir]));
  }
});

// Server
gulp.task('server', function(){
  var server = express()
    .use(express.static(path.resolve(Config.paths.app.root)))
    .listen(Config.port);
  gutil.log('Server listening on port ' + Config.port);
});

// LiveReload
gulp.task('livereload', function(){
  livereload.listen(Config.livereload_port, function(err) {
    if(err) gutil.log('Livereload error:', err);
  })
});

// Watches
gulp.task('watch', function(){
  watch(Config.paths.app.scss + '/**/*.scss', function(){
    gulp.start('styles');
  });
  watch(Config.paths.app.tmpl + '/**/*.hbs', function(){
    gulp.start('templates');
  });
  gulp.watch([
    Config.paths.app.images + '/**/*.png',
    Config.paths.app.images + '/**/*.jpg',
    Config.paths.app.images + '/**/*.jpeg',
    Config.paths.app.images + '/**/*.gif',
    Config.paths.app.css + '/**/*.css',
    Config.paths.app.js + '/**/*.js',
    Config.paths.app.root + '/**/*.html'
  ], function(evt){
    livereload.changed(evt.path);
  });
});

gulp.task('clear', function (done) {
  return cache.clearAll(done);
});

gulp.task('clean', ['fonts:clean', 'images:clean', 'html:clean', 'extra:clean']);
gulp.task('build', ['templates', 'styles', 'fonts', 'extra', 'html', 'images']);
gulp.task('default', ['server', 'livereload', 'templates', 'styles', 'watch'], function(){
  if(argv.o) opn('http://localhost:' + Config.port);
});
