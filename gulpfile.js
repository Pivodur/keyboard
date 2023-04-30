const { src, dest, watch, parallel, series } = require('gulp');

const scss            = require('gulp-sass')(require('sass'));
const concat          = require('gulp-concat');
const autoprefixer    = require('gulp-autoprefixer');
const uglify          = require('gulp-uglify');
const browserSync     = require('browser-sync').create();
const imagemin        = require('gulp-imagemin');
const sourcemaps      = require('gulp-sourcemaps'); 
const del             = require('del');




function browsersync() {
   browserSync.init({
      server: {
         baseDir: 'app/'
      },
      notify: false,
      browser: "chrome"
   })
};

function styles(){
   return src('app/scss/style.scss')
      .pipe(sourcemaps.init())
      .pipe(scss({outputStyle: 'compressed'}))
      .pipe(concat('style.min.css'))
      .pipe(autoprefixer({
         overrideBrowserslist: ['last 10 versions'],
         grid: true
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(dest('app/css'))
      .pipe(browserSync.stream())
};

function scripts(){
   return src(['app/js/main.js'])
      .pipe(sourcemaps.init())
      .pipe(concat('main.min.js'))
      .pipe(uglify())
      .pipe(sourcemaps.write('.'))
      .pipe(dest('app/js'))
      .pipe(browserSync.stream())
};

function images() {
   return src('app/images/**/*.*')
   .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
	   imagemin.mozjpeg({quality: 75, progressive: true}),
	   imagemin.optipng({optimizationLevel: 5}),
	   imagemin.svgo({
		         plugins: [
			         {removeViewBox: true},
			         {cleanupIDs: false}
		         ]
	   })
   ]))
   .pipe(dest('dist/images'))
};

function watching(){
    watch(['app/scss/**/*.scss'], styles); 
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/**/*.html']).on('change', browserSync.reload)
};

function build(){
   return src([
      'app/**/*.html',
      'app/css/style.min.css',
      'app/js/main.min.js'
   ], {base: 'app'})
   .pipe(dest('dist'))
}

function cleanDist() {
   return del('dist')
};

   
exports.styles      = styles;
exports.browsersync = browsersync;
exports.scripts     = scripts;
exports.watching    = watching;
exports.images      = images;
exports.cleanDist   = cleanDist;
exports.build       = series(cleanDist, images, build);

exports.default = parallel(styles, browsersync, scripts, watching)