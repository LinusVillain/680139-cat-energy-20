const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const mincss = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const minjs = require("gulp-uglify");
const minHtml = require("gulp-htmlmin");

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(mincss())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
};

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

exports.server = server;

//  Webp

const towebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"));
};

exports.towebp = towebp;

//  Svg sprite

const sprite = () => {
  return gulp.src("source/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
};

exports.sprite = sprite;

//  Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.mozjpeg({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
};

exports.images = images;

//  Html

const html = () => {
  return gulp.src("source/*.html")
    .pipe(gulp.dest("build"))
    .pipe(minHtml({ collapseWhitespace: true }))
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(gulp.dest("build"))
    .pipe(sync.stream());
};

exports.sprite = sprite;


//  Copy

const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/*.ico"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"))
  .pipe(sync.stream());
};

exports.copy = copy;

//  Clean

const clean = () => {
  return del("build");
};

exports.clean = clean;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series(styles));
  gulp.watch("source/js/**/*.js", gulp.series(scripts));
  gulp.watch("source/*.html", gulp.series(html));
};

//Scripts

const scripts = () => {
  return gulp.src("source/js/**/*.js")
    .pipe(gulp.dest("build/js"))
    .pipe(minjs())
    .pipe(rename("index.min.js"))
    .pipe(gulp.dest("build/js"));
};

exports.default = gulp.series(
  styles, server, watcher
);

const build = gulp.series(
  clean,
  styles,
  scripts,
  html,
  images,
  towebp,
  sprite,
  copy
);

exports.build = build;

const start = gulp.series(
  build,
  server,
  watcher
);

exports.start = start;
