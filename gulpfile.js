var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    gnf = require('gulp-npm-files'),
    config = require('config'),
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    minifyCss = require('gulp-minify-css'),
    bower = require('gulp-bower'),
    wiredep = require('gulp-wiredep')
;

gulp.task('copyNpmDeps', function() {
    gulp.src(gnf(), {base:'./'}).pipe(gulp.dest(config.node.buildDir));
});

gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest('./modules/components'));
});

gulp.task('wiredep', function() {
    return gulp.src("./modules/system/views/index.ejs")
        .pipe(wiredep({
            directory: "modules/components"
            , ignorePath: "../.."
        }))
        .pipe(gulp.dest("./modules/system/views"));
});

gulp.task('copyCode', function() {
    ['article', 'cde', 'form', 'processManager', 'system'].forEach(function(module) {
        gulp.src('./modules/' + module + '/node-js/**/*')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/node-js/'));
        gulp.src('./modules/' + module + '/shared/**/*')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/shared/'));
        gulp.src('./modules/' + module + '/views/**/*.ejs')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/views/'));
        gulp.src('./modules/' + module + '/**/*.html')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/'));
    });

    gulp.src('./modules/**/*.png')
        .pipe(gulp.dest(config.node.buildDir + "/modules/"));
    gulp.src('./modules/**/*.ico')
        .pipe(gulp.dest(config.node.buildDir + "/modules/"));
    gulp.src('./modules/system/public/robots.txt')
        .pipe(gulp.dest(config.node.buildDir + "/modules/system/public/"));
    
    gulp.src('./config/*.json')
        .pipe(gulp.dest(config.node.buildDir + "/config/"));

    gulp.src('./app.js')
        .pipe(gulp.dest(config.node.buildDir + "/"));

    gulp.src('./deploy/*')
        .pipe(gulp.dest(config.node.buildDir + "/deploy/"));

});

gulp.task('usemin', function() {
    [{src: "./modules/system/views/includeFrontEndJS.ejs", dest: "system/views/"},
        {src: "./modules/form/views/includeFrontEndJS.ejs", dest: "form/views"},
        {src: "./modules/cde/views/includeFrontEndJS.ejs", dest: "cde/views"},
        {src: "./modules/system/views/index.ejs", dest: "system/views"}
    ].forEach(function (path) {
            return gulp.src(path.src)
                .pipe(usemin({
                    assetsDir: "./modules/",
                    css: [ rev ],
                    js: [ uglify(), 'concat' ]
                }))
                .pipe(gulp.dest(config.node.buildDir + '/modules/' + path.dest));
        });
});


gulp.task('default', ['copyNpmDeps', 'bower', 'wiredep', 'copyCode', 'usemin']);

