"use strict";

const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const server = require("browser-sync").create();
const webp = require("gulp-webp");
const del = require("del");
const mincss = require("gulp-csso");
const sprite = require("gulp-svgstore");
const post_html = require("gulp-html-replace");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");

gulp.task("css", function () {
  return gulp.src("source/scss/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(server.stream());
});

gulp.task("server", function () {
  server.init({
    server: "source/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/scss/**/*.{scss,sass}", gulp.series("css"));
  gulp.watch("source/*.html").on("change", server.reload);
});

gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{jpeg,jpg,png,tiff}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
});

gulp.task('clean', function(){
  return del('./build', {force:true});
});

gulp.task("css_admin", function () {
  return gulp.src("./source/**/*.css")
    .pipe(mincss())
    .pipe(rename("style-min.css"))
    .pipe(gulp.dest('./build/css'));
});

gulp.task("html_admin", function () {
  return gulp.src("./source/**/*.html")
    .pipe(post_html({minify: '<link rel="stylesheet" href="./css/style-min.css">'}))
    .pipe(gulp.dest("./build"));
});

gulp.task("img", function () {
  return gulp.src(["source/img/**/*.*", "!source/img/**/sprite.svg"])
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
    ]))
    .pipe(gulp.dest('./build/img'));
});

gulp.task("js", function () {
  return gulp.src("source/js/*.js")
    .pipe(gulp.dest('./build/js'));
});

gulp.task("sprite", function () {
  return gulp.src(["./source/img/icon-*.svg","./source/img/bg*.svg"])
    .pipe(sprite({
      inlineSvg: true
    }))
    .pipe(rename(function (path) {
      path.basename = "sprite";
      path.extname = ".svg";
    }))
    .pipe(gulp.dest("./build/img/svg"))
    .pipe(gulp.dest("./source/img/svg"))
});

gulp.task("fonts", function () {
  return gulp.src("source/fonts/**/*.*")
    .pipe(gulp.dest('./build/fonts'));
});

gulp.task("admin_server", function () {

  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

});

gulp.task("admin", gulp.series("clean","css","css_admin","html_admin","img","webp","sprite","js","fonts"));

gulp.task("start", gulp.series("css","webp", "server"));
