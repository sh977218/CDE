var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    gnf = require('gulp-npm-files'),
    config = require('./modules/system/node-js/parseConfig'),
    usemin = require('gulp-usemin'),
    minifyCss = require('gulp-minify-css'),
    bower = require('gulp-bower'),
    wiredep = require('gulp-wiredep'),
    request = require('request'),
    elastic = require('./deploy/elasticSearchInit.js')
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

    gulp.src('./modules/components/**/*')
        .pipe(gulp.dest(config.node.buildDir + "/modules/components/"));

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
    [
        {folder: "./modules/system/views/", filename: "index.ejs"},
        {folder: "./modules/system/views/", filename: "includeFrontEndJS.ejs"},
        {folder: "./modules/cde/views/", filename: "includeCdeFrontEndJS.ejs"},
        {folder: "./modules/form/views/", filename: "includeFormFrontEndJS.ejs"}
    ].forEach(function (item) {
            return gulp.src(item.folder + item.filename)
                .pipe(usemin({
                    assetsDir: "./modules/",
                    css: [minifyCss({root: "./", relativeTo: "./", rebase: true}), 'concat'],
                    js: [ uglify({mangle: false}), 'concat' ]
                }))
                .pipe(gulp.dest(config.node.buildDir + '/modules/'))
                .on('end', function() {
                    gulp.src(config.node.buildDir + '/modules/' + item.filename)
                        .pipe(gulp.dest(config.node.buildDir + "/" + item.folder));
                });
        });
});

gulp.task('es', function() {
    [config.elasticUri, config.elasticRiverUri, config.elasticFormUri, config.elasticFormRiverUri,
        config.elasticBoardIndexUri, config.elasticBoardRiverUri, config.elasticStoredQueryUri].forEach(function(uri) {
            request.del(uri);
        });

    [
        {uri: config.elasticUri, data: elastic.createIndexJson},
        {uri: config.elasticRiverUri + "/_meta", data: elastic.createRiverJson},
        {uri: config.elasticFormUri, data: elastic.createFormIndexJson},
        {uri: config.elasticFormRiverUri + "/_meta", data: elastic.createFormRiverJson},
        {uri: config.elasticBoardIndexUri, data: elastic.createBoardIndexJson},
        {uri: config.elasticBoardRiverUri + "/_meta", data: elastic.createBoardRiverJson},
        {uri: config.elasticStoredQueryUri, data: elastic.createStoredQueryIndexJson}
    ].forEach(function(item) {
        request.post(item.uri, {json: true, body: item.data});
    });

});

gulp.task('default', ['copyNpmDeps', 'copyCode', 'usemin']);

