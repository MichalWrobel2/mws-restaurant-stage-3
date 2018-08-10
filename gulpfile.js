const	gulp	=	require('gulp'),
      autoprefixer = require('gulp-autoprefixer'),
      babel = require('gulp-babel'),
      cleanCSS = require('gulp-clean-css'),
      concat = require('gulp-concat'),
      // critical = require('critical').stream, //Critical extracts & inlines critical-path (above-the-fold) CSS from HTML
      gulpIf = require('gulp-if'), //For minification of assets or other modifications,  to conditionally handle specific types of assets.
      uglify = require('gulp-uglify'),
      useref = require('gulp-useref'),  //  parse the build blocks in the HTML
      rename = require('gulp-rename');

const options = {
    toplevel: true,
    compress: {
        passes: 2
    },
    output: {
        beautify: false,
        preamble: "/* uglified */"
    }
};

// basic test
gulp.task('default', ['useref', 'css', 'scripts-dist'/*, 'copy-sw', 'copy-html', 'copy-images', 'copy-js'*/], function (done) {
  console.log('Gulp js is running')
  done()
});
gulp.task('copy-html', function() {
    gulp.src(['index.html', 'restaurant.html'])
        .pipe(gulp.dest('public'));
});
gulp.task('copy-images', function() {
    gulp.src('src/images/*')
        .pipe(gulp.dest('dist/images'));
});
gulp.task('copy-sw', function () {
    	gulp.src('src/sw.js')
      .pipe(gulp.dest('dist'));
 });
 gulp.task('copy-js', function () {
     	gulp.src(['src/js/idb.js', 'src/js/dbhelper.js'])
       .pipe(gulp.dest('dist/js'));
  });


// optimize JS
gulp.task('useref', function() {
  return gulp.src('*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('public'));
});

gulp.task('scripts-dist', function () {
	gulp.src(['js/main.js', 'js/restaurant_info.js'])
    // .pipe(babel({ presets: ['env'] }))
    .pipe(concat('bundle.js'))
		.pipe(rename("bundle.min.js"))
		.pipe(uglify(options))
		.pipe(gulp.dest('public/js'))
});

// gulp.task('js', function() {
//    return gulp.src('dist/js/dbhelper.js')
//               .pipe(rename({
//                 suffix: '.min'
//               }))
//               .pipe(uglify())
//               .pipe(gulp.dest('dist/js'));
// });

 //css
gulp.task('css', function () {
    return gulp.src('**/*.css')
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(concat('bundle.css'))
    .pipe(rename('bundle.min.css'))
    .pipe(gulp.dest('public/css'));
});

// Optimizing critical path
// gulp.task('critical', function () {
//   return gulp.src('src/index.html')
//     .pipe(critical({
//       base: 'src',
//       inline: true,
//       dimensions: [{
//         width: 320,
//         height: 480
//       }, {
//         width: 900,
//         height: 1200
//       }],
//       minify: true
//     }))
//     .pipe(gulp.dest('src'));
// });