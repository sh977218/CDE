var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    gnf = require('gulp-npm-files'),
    config = require('config'),
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    minifyCss = require('gulp-minify-css'),
    bower = require('gulp-bower'),
    wiredep = require('gulp-wiredep');
    cssnano = require('gulp-cssnano')
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
        gulp.src('./modules/' + module + '/**/*.html')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/'));
        gulp.src('./modules/' + module + '/**/*.png')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/'));
        gulp.src('./modules/' + module + '/**/*.ico')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/'));
        gulp.src('./modules/' + module + '/**/*.gif')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/'));
    });

    ['supportedBrowsers.ejs', 'loginText.ejs', 'webtrends.ejs'].forEach(function(file) {
        gulp.src('./modules/system/views/' + file)
            .pipe(gulp.dest(config.node.buildDir + "/modules/system/views/"));
    });

    gulp.src('./modules/system/public/robots.txt')
        .pipe(gulp.dest(config.node.buildDir + "/modules/system/public/"));
    
    gulp.src('./config/*.json')
        .pipe(gulp.dest(config.node.buildDir + "/config/"));

    gulp.src('./app.js')
        .pipe(gulp.dest(config.node.buildDir + "/"));

    gulp.src('./deploy/*')
        .pipe(gulp.dest(config.node.buildDir + "/deploy/"));

    //gulp.src('./modules/components/*/fonts/*')
    //    .pipe(gulp.dest(config.node.buildDir + "/modules/system/public/assets/fonts/"));
    //gulp.src('./modules/components/bootstrap/fonts/*')
    //    .pipe(gulp.dest(config.node.buildDir + "/modules/system/public/assets/fonts/"));

});

gulp.task('usemin', function() {
    [
        {folder: "./modules/system/views/", filename: "index.ejs"},
        {folder: "./modules/system/views/", filename: "includeFrontEndJS.ejs"},
        {folder: "./modules/cde/views/", filename: "includeCdeFrontEndJS.ejs"},
        {folder: "./modules/form/views/", filename: "includeFormFrontEndJS.ejs"},
    ].forEach(function (item) {
            return gulp.src(item.folder + item.filename)
                .pipe(usemin({
                    assetsDir: "./modules/",
                    css: [minifyCss({root: "./", relativeTo: "/", rebase: true}), 'concat'],
                    js: [ uglify({mangle: false}), 'concat' ]
                }))
                .pipe(gulp.dest(config.node.buildDir + '/modules/'))
                .on('end', function() {
                    gulp.src(config.node.buildDir + '/modules/' + item.filename)
                        .pipe(gulp.dest(config.node.buildDir + "/" + item.folder));
                });
        });
});


gulp.task('default', ['copyNpmDeps', 'copyCode', 'usemin']);

