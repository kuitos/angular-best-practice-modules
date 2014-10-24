/**
 * @author kui.liu
 * @since 2014/09/29 上午11:45
 */
"use strict";

var webRoot = "src/main/webapp/",
    gulp = require('gulp'),
    del = require('del'),
    runSequence = require('run-sequence'),
    minifyCss = require('gulp-minify-css'),
    minifyHtml = require('gulp-minify-html'),
    uglify = require('gulp-uglify'),
    rev = require('gulp-rev'),
    replace = require('gulp-replace'),
    usemin = require('gulp-usemin');

/*------------------------- 清空dist目录 -----------------------------*/
gulp.task('clean', function (cb) {
    del(webRoot + "dist/*", cb);
});

/*------------------------- 拷贝资源文件 -----------------------------*/
gulp.task('copy-tpl', function () {
    return gulp.src(webRoot + 'src/tpls/**/*.html')
        //        .pipe(minifyHtml({empty: true, quotes: true}))
        .pipe(gulp.dest(webRoot + 'dist/tpls'));
});

gulp.task('copy-font', function () {
    return gulp.src(webRoot + 'src/fonts/*')
        .pipe(gulp.dest(webRoot + 'dist/fonts/'));
});

gulp.task('copy-image', function () {
    return gulp.src(webRoot + 'src/images/**/*')
        .pipe(gulp.dest(webRoot + 'dist/images'));
});

gulp.task('copy-ccmsPop-image', function () {
    return gulp.src(webRoot + 'src/js/lib/ccms_pop/css/img/*')
        .pipe(gulp.dest(webRoot + 'dist/css/img/'));
});

gulp.task('copy-jqueryui-image', function () {
    return gulp.src(webRoot + 'src/js/lib/jquery-ui/development-bundle/themes/base/images/*')
        .pipe(gulp.dest(webRoot + 'dist/css/images'));
});

/*------------------------- 对首页引用的css、js作合并压缩，并根据文件md5值自动更新 -----------------------------*/
/*------------------------- 首页html需要加入build标识，具体参照gulp-usemin插件文档 -----------------------------*/
gulp.task('usemin', function () {
    return gulp.src(webRoot + 'src/index.html')
        .pipe(replace(/\/src\/(js|css)/g, '$1'))
        .pipe(usemin({
            css: [minifyCss({keepSpecialComments: 0}), rev()],
            //            html: [minifyHtml({empty: true, quotes: true})],
            js : [uglify(), rev()]
        }))
        .pipe(replace(/(js\/|css\/)/g, "/dist/$1"))
        .pipe(replace(/\/src\//g, "/dist/"))
        .pipe(gulp.dest(webRoot + 'dist/'));
});

// 定义构建任务队列
gulp.task('build', function (cb) {
    runSequence('clean', ['copy-tpl', 'copy-font', 'copy-image', 'copy-ccmsPop-image', 'copy-jqueryui-image', 'usemin'], cb);
});
