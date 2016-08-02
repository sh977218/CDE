var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    gnf = require('gulp-npm-files'),
    config = require('./modules/system/node-js/parseConfig'),
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    minifyCss = require('gulp-minify-css'),
    bower = require('gulp-bower'),
    install = require('gulp-install'),
    wiredep = require('gulp-wiredep'),
    tar = require('tar'),
    zlib = require('zlib'),
    fs = require('fs'),
    fstream = require('fstream'),
    spawn = require('child_process').spawn,
    elastic = require('./modules/system/node-js/createIndexes'),
    git = require('gulp-git'),
    templateCache = require('gulp-angular-templatecache')
;

require('es6-promise').polyfill();

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

gulp.task('wiredep', ['bower'], function() {
    return gulp.src("./modules/system/views/index.ejs")
        .pipe(wiredep({
            directory: "modules/components"
            , ignorePath: "../.."
        }))
        .pipe(gulp.dest("./modules/system/views"));
});

gulp.task('copyCode', ['wiredep'], function() {
    ['article', 'cde', 'form', 'processManager', 'system', 'batch', 'embedded'].forEach(function(module) {
        gulp.src('./modules/' + module + '/node-js/**/*')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/node-js/'));
        gulp.src('./modules/' + module + '/shared/**/*')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/shared/'));
        gulp.src('./modules/' + module + '/**/*.png')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/'));
        gulp.src('./modules/' + module + '/**/*.ico')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/'));
        gulp.src('./modules/' + module + '/**/*.gif')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/'));
        gulp.src('./modules/' + module + '/views/**/*.html')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/views/'));
    });

    ['supportedBrowsers.ejs', 'loginText.ejs'].forEach(function(file) {
        gulp.src('./modules/system/views/' + file)
            .pipe(gulp.dest(config.node.buildDir + "/modules/system/views/"));
    });

    gulp.src('./modules/components/**/*')
        .pipe(gulp.dest(config.node.buildDir + "/modules/components/"));

    gulp.src('./modules/processManager/pmApp.js')
        .pipe(gulp.dest(config.node.buildDir + "/modules/processManager/"));

    gulp.src('./modules/system/public/robots.txt')
        .pipe(gulp.dest(config.node.buildDir + "/modules/system/public/"));


    gulp.src('./config/*.json')
        .pipe(gulp.dest(config.node.buildDir + "/config/"));

    gulp.src('./app.js')
        .pipe(gulp.dest(config.node.buildDir + "/"));
    gulp.src('./package.json')
        .pipe(gulp.dest(config.node.buildDir + "/"));

    gulp.src('./deploy/*')
        .pipe(gulp.dest(config.node.buildDir + "/deploy/"));

    gulp.src('./ingester/**')
        .pipe(gulp.dest(config.node.buildDir + "/ingester/"));

    //gulp.src('./modules/embedded/**')
    //    .pipe(gulp.dest(config.node.buildDir + "/modules/embedded"));

    gulp.src('./modules/form/public/assets/sdc/*')
        .pipe(gulp.dest(config.node.buildDir + "/modules/form/public/assets/sdc"));

});

gulp.task('angularTemplates', function() {
    ['cde', 'form', 'system', 'article', 'embedded'].forEach(function(module) {
        gulp
            .src("modules/" + module + "/public/js/angularTemplates.js")
            .pipe(gulp.dest("modules/" + module + "/public/js/bkup/"));
        return gulp.src("modules/" + module + "/public/html/**/*.html")
            .pipe(templateCache({
                root: "/" + module + "/public/html",
                filename: "angularTemplates.js",
                module: module + "Templates",
                standalone: true
            }))
            .pipe(gulp.dest("modules/" + module + "/public/js/"));
    });
});

gulp.task('prepareVersion', ['copyCode'], function() {
    setTimeout(function() {
        git.revParse({args:'--short HEAD'}, function(err, hash) {
            fs.writeFile(config.node.buildDir + "/modules/system/node-js/version.js", "exports.version = '" + hash + "';", function(err) {
                if (err)  console.log("ERROR generating version.html: " + err);
                else console.log("generated " + config.node.buildDir + "/modules/system/node-js/version.js");
            });
        });
    }, 15000);
});

gulp.task('usemin', ['copyCode', 'angularTemplates'], function() {
    [
        {folder: "./modules/system/views/", filename: "index.ejs"},
        {folder: "./modules/system/views/", filename: "includeFrontEndJS.ejs"},
        {folder: "./modules/cde/views/", filename: "includeCdeFrontEndJS.ejs"},
        {folder: "./modules/form/views/", filename: "includeFormFrontEndJS.ejs"},
        {folder: "./modules/embedded/public/html/", filename: "index.html"}
    ].forEach(function (item) {
            return gulp.src(item.folder + item.filename)
                .pipe(usemin({
                    assetsDir: "./modules/",
                    css: [minifyCss({target: "./modules/system/assets/css/vendor", rebase: true}), 'concat', rev()],
                    js: [ uglify({mangle: false}), 'concat', rev() ]
                }))
                .pipe(gulp.dest(config.node.buildDir + '/modules/'))
                .on('end', function() {
                    gulp.src(config.node.buildDir + '/modules/' + item.filename)
                        .pipe(gulp.dest(config.node.buildDir + "/" + item.folder));
                });
        });
});

gulp.task('emptyTemplates', ['usemin'], function() {
    ['cde', 'form', 'system', 'article'].forEach(function(module) {
        return gulp.src("modules/" + module + "/public/js/bkup/angularTemplates.js")
            .pipe(gulp.dest("modules/" + module + "/public/js/"));
    });
});

gulp.task('es', function() {
    elastic.deleteIndices();

    // dont know why but gulp wont exit this. Kill it.
    setTimeout(function() {
        process.exit(0);
    }, 3000);
});

gulp.task('tarCode', function () {
    //var done = this.async();
    var writeS = fs.createWriteStream('./code.tar.gz');
    writeS.on('close', function () {
        // tar done, now sign with gpg
        var gpg = spawn('gpg', ["-s", "./code.tar.gz"]);
        gpg.on('close', function () {
            fs.unlinkSync("./code.tar.gz");
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

gulp.task('default', ['copyNpmDeps', 'copyCode', 'angularTemplates', 'prepareVersion', 'usemin', 'emptyTemplates']);


