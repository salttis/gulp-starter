'use strict';
var argv         = require('minimist')(process.argv.slice(2))
  , gulp         = require('gulp')
  , git          = require('gulp-git')
  , cache        = require('gulp-cache')
  , watch        = require('gulp-watch')
  , gutil        = require('gulp-util')
  , gulpif       = require('gulp-if')
  , gulpifelse   = require('gulp-if-else')
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
  , concat       = require('gulp-concat')
  , defineModule = require('gulp-define-module')
  , declare      = require('gulp-declare')
  , handlebars   = require('gulp-handlebars')
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
  cache: (typeof argv.cache !== 'undefined' ? !!argv.cache : true),
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
    dist: {
      root:   'dist',
      js:     'dist/js',
      css:    'dist/css',
      images: 'dist/img',
      fonts:  'dist/fonts',
      lib:    'dist/lib',
      extra: [
        //'dist/foo/',
        //'dist/bar/'
      ]
    }
  }
}

// Tasks
// =====

// Bootstrapping
gulp.task('bootstrap:orphan', git.checkout.bind(null, 'orphaned-temp-branch', {args: '-f --orphan '}));
gulp.task('bootstrap:master', ['bootstrap:commit'], git.branch.bind(null, 'master', {args: '-M '}));
gulp.task('bootstrap:commit', ['bootstrap:orphan'], function(){
  return gulp.src('.')
    .pipe(git.commit('Bootstrapped initial commit'));    
});

gulp.task('bootstrap', ['bootstrap:master'], function(){      
     
});

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
gulp.task('fonts:clean', function(){
  return gulp.src(Config.paths.dist.fonts + '/**/*', { read: false })
    .pipe(clean());
});
gulp.task('fonts', ['fonts:clean'], function(){
  return gulp.src(Config.paths.app.fonts + '/**/*')
    .pipe(gulp.dest(Config.paths.dist.fonts + '/'));
});

// Images
gulp.task('images:clean', function(){
  return gulp.src(Config.paths.dist.images + '/**/*', { read: false })
    .pipe(gulpif(!Config.cache, clean()));
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
    .pipe(gulp.dest(Config.paths.dist.images + '/'));
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
gulp.task('html:clean', function(){
  return gulp.src([Config.paths.dist.root + '/**/*.html', Config.paths.dist.root + '/**/*.css', Config.paths.dist.root + '/**/*.js'], { read: false })
    .pipe(clean());
});
gulp.task('html', ['html:clean'], function(){
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

// Extra folders
gulp.task('extra:clean', function(){
  gulp.src(Config.paths.dist.extra, { read: false })
    .pipe(clean());
})
gulp.task('extra', ['extra:clean'], function(){
  for(var dir in Config.paths.app.extra) {
    gulp.src(Config.paths.app.extra[dir])
      .pipe(gulp.dest(Config.paths.dist.extra[dir]));
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
  lr = tinylr();
  lr.listen(Config.livereload_port, function(err) {
    if(err) gutil.log('Livereload error:', err);
  })
});

// Watches
gulp.task('watch', function(){
  watch({ glob: Config.paths.app.scss + '/**/*.scss' }, function(){
    gulp.start('styles');
  });
  watch({ glob: Config.paths.app.tmpl + '/**/*.hbs' }, function(){
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
    refresh(lr).changed(evt.path);
  })
});

gulp.task('build', ['templates', 'styles', 'fonts', 'extra', 'html', 'images']);
gulp.task('default', ['server', 'livereload', 'templates', 'styles', 'watch'], function(){
  if(argv.o) opn('http://localhost:' + Config.port);
});
