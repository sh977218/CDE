var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    gnf = require('gulp-npm-files'),
    config = require('config'),
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    minifyCss = require('gulp-minify-css')
;

gulp.task('copyNpmDeps', function() {
    gulp.src(gnf(), {base:'./'}).pipe(gulp.dest(config.node.buildDir));
});

gulp.task('copyCode', function() {
    ['article', 'cde', 'form', 'processManager', 'system'].forEach(function(module) {
        gulp.src('./modules/' + module + '/**/*')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/'));
    });

    gulp.src('./config/*.json')
        .pipe(gulp.dest(config.node.buildDir + "/config/"));

    gulp.src('./app.js')
        .pipe(gulp.dest(config.node.buildDir + "/"));

});

gulp.task('usemin', function() {
    ["./modules/system/views/includeFrontEndJS.ejs",
        "./modules/form/views/includeFrontEndJS.ejs",
        "./modules/cde/views/includeFrontEndJS.ejs",
        "./modules/system/views/index.ejs"
    ].forEach(function (path) {
            return gulp.src(path)
                .pipe(usemin({
                    assetsDir: "./modules/",
                    css: [ rev ],
                    html: [ function () {return minifyHtml({ empty: true });} ],
                    js: [ uglify, rev ],
                    inlinejs: [ uglify ],
                    inlinecss: [ minifyCss, 'concat' ]
                }))
                .pipe(gulp.dest(config.node.buildDir + '/modules/'));

        });
});

gulp.task('default', ['copyNpmDeps', 'copyCode', 'usemin']);

