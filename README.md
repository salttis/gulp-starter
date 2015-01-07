# Gulp Starter

<img align="right" src="https://raw.github.com/3bola/gulp-starter/master/app/img/pipboy.jpg" hspace="20" vspace="10" width="320">

A gulp.js starter template with basic tasks for development and production.

* Source: [http://github.com/3bola/gulp-starter](http://github.com/3bola/gulp-starter)
* Issues: [https://github.com/3bola/gulp-starter/issues](https://github.com/3bola/gulp-starter/issues)

### Features

* Simple HTML5 boilerplate
* Separated development environment
* Livereloading development server with automatic building of SCSS files
* Bower component management
* Automatic image compressing
* SCSS compiling
* CSS autoprefixing, combining and minifying
* JavaScript combining and compressing with uglify
* Handlebars templates
* Font Awesome icons

### Usage

#### Install

* Make sure you have latest [NodeJS](http://nodejs.org/) installed.
* Install [Chrome LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en) plugin. (Optional)

Run:
```sh
git clone https://github.com/3bola/gulp-starter.git && cd gulp-starter && npm install
```

Then just wait for your browser to open [http://localhost:8080/](http://localhost:8080/)!

#### Development server

To start the development server, run:
```sh
gulp
```

To open the URL in your browser at the same time, run:
```sh
gulp -o
```

#### Building

To build and compress the application to the `dist` folder, run:
```sh
gulp build
```

#### Templates

Template files are loaded automatically to global object `tmpl`.
For example file `Main.ListView.hbs` would be accessible from `tmpl.Main.ListView` function.

#### Image caching

The build script does not automatically cache the compressed images. If you want to cache the images, run the build script with:
```sh
gulp build --cache
```

#### Configuration

You can find some useful options in the `gulpfile.js` file.

### License

#### The MIT License (MIT)

Copyright (c) Juri Saltbacka

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
