var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    gnf = require('gulp-npm-files'),
    config = require('./modules/system/node-js/parseConfig'),
    usemin = require('gulp-usemin'),
    minifyCss = require('gulp-minify-css'),
    bower = require('gulp-bower'),
    install = require('gulp-install'),
    wiredep = require('gulp-wiredep'),
    request = require('request'),
    elastic = require('./deploy/elasticSearchInit.js'),
    tar = require('tar'),
    zlib = require('zlib'),
    fs = require('fs'),
    fstream = require('fstream'),
    spawn = require('child_process').spawn
;

gulp.task('npm', function() {
    gulp.src(['./package.json'])
        .pipe(install());
});

gulp.task('copyNpmDeps', ['npm'], function() {
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

gulp.task('tarCode', function () {
    //var done = this.async();
    var writeS = fs.createWriteStream('./code.tar.gz');
    writeS.on('close', function () {
        // tar done, now sign with gpg
        var gpg = spawn('gpg', ["-s", "./code.tar.gz"]);
        gpg.on('close', function (code) {
            fs.unlinkSync("./code.tar.gz");
            //done();
        });
    });
    var fixupDirs = function (entry) {
        // Make sure readable directories have execute permission
        if (entry.props.type === "Directory")
            entry.props.mode |= (entry.props.mode >>> 2) & 0111;
        return true;
    };

    return fstream.Reader({path: config.node.buildDir, type: 'Directory', filter: fixupDirs})
        .pipe(tar.Pack())
        .pipe(zlib.createGzip())
        .pipe(writeS);
});

gulp.task('default', ['copyNpmDeps', 'copyCode', 'usemin']);

