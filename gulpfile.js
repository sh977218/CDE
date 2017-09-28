var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    config = require('./modules/system/node-js/parseConfig'),
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    minifyCss = require('gulp-clean-css'),
    bower = require('gulp-bower'),
    install = require('gulp-install'),
    wiredep = require('gulp-wiredep'),
    tar = require('tar'),
    zlib = require('zlib'),
    fs = require('fs'),
    fstream = require('fstream'),
    spawn = require('child_process').spawn,
    esInit = require('./modules/system/node-js/elasticSearchInit'),
    git = require('gulp-git'),
    templateCache = require('gulp-angular-templatecache'),
    run = require('gulp-run')
    ;

require('es6-promise').polyfill();

gulp.task('npm', function () {
    return gulp.src(['./package.json'])
        .pipe(install());
});

gulp.task('copyNpmDeps', ['npm'], function () {
    return gulp.src(['./package.json'])
        .pipe(gulp.dest(config.node.buildDir))
        .pipe(install({production: true}));
});

gulp.task('bower', function () {
    return bower()
        .pipe(gulp.dest('./modules/components'));
});

gulp.task('thirdParty', ['npm', 'bower'], function () {
    let promiseArray = [];

    promiseArray.push(gulp.src('./node_modules/core-js/client/shim.min.js')
        .pipe(gulp.dest('./modules/static/')));
    promiseArray.push(gulp.src('./node_modules/classlist.js/classList.min.js')
        .pipe(gulp.dest('./modules/static/')));
    promiseArray.push(gulp.src('./node_modules/html5-formdata/formdata.js')
        .pipe(gulp.dest('./modules/static/')));
    promiseArray.push(gulp.src('./node_modules/js-polyfills/typedarray.js')
        .pipe(gulp.dest('./modules/static/')));
    promiseArray.push(gulp.src('./node_modules/Blob.js/Blob.js')
        .pipe(gulp.dest('./modules/static/')));
    promiseArray.push(gulp.src('./node_modules/intl/locale-data/jsonp/en.js')
        .pipe(gulp.dest('./modules/static/')));
    promiseArray.push(gulp.src('./node_modules/intl/dist/Intl.min.js')
        .pipe(gulp.dest('./modules/static/')));

    return Promise.all(promiseArray);

});

gulp.task('lhc-wiredep', ['bower'], function () {
    return gulp.src("./modules/form/public/html/lformsRender.html")
        .pipe(wiredep({
            directory: "modules/components"
            , ignorePath: "../../.."
        }))
        .pipe(gulp.dest("./modules/form/public/html"));
});

gulp.task('nativefollow-wiredep', ['bower'], function() {
    return gulp.src("./modules/form/public/html/nativeRenderStandalone.html")
        .pipe(wiredep({
            directory: "modules/components",
            exclude: ['/components/autocomplete-lhc', '/components/ngSmoothScroll',
                '/components/lforms', '/components/oboe', '/components/traverse',
                '/components/lodash', '/components/lforms-converter'
            ],
            ignorePath: "../../.."
        }))
        .pipe(gulp.dest("./modules/form/public/html"));
});

gulp.task('wiredep', ['bower'], function () {
    return gulp.src("./modules/system/views/index.ejs")
        .pipe(wiredep({
            directory: "modules/components",
            exclude: ['/components/autocomplete-lhc', '/components/ngSmoothScroll',
                '/components/lforms', '/components/oboe', '/components/traverse',
                '/components/lodash', '/components/lforms-converter'
            ],
            ignorePath: "../.."
        }))
        .pipe(gulp.dest("./modules/system/views"));
});

gulp.task('copyCode', ['wiredep', 'lhc-wiredep', 'nativefollow-wiredep'], function () {

    let promiseArray = [];

    ['cde', 'form', 'processManager', 'system', 'embedded', 'board'].forEach(function (module) {
        promiseArray.push(gulp.src('./modules/' + module + '/node-js/**/*')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/node-js/')));
        promiseArray.push(gulp.src('./modules/' + module + '/shared/**/*')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/shared/')));
        promiseArray.push(gulp.src('./modules/' + module + '/**/*.png')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/')));
        promiseArray.push(gulp.src('./modules/' + module + '/**/*.ico')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/')));
        promiseArray.push(gulp.src('./modules/' + module + '/**/*.gif')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/')));
        promiseArray.push(gulp.src('./modules/' + module + '/views/**/*.html')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/views/')));
    });

    ['supportedBrowsers.ejs', 'loginText.ejs'].forEach(function (file) {
        promiseArray.push(gulp.src('./modules/system/views/' + file)
            .pipe(gulp.dest(config.node.buildDir + "/modules/system/views/")));
    });

    promiseArray.push(gulp.src('./modules/components/**/*')
        .pipe(gulp.dest(config.node.buildDir + "/modules/components/")));

    promiseArray.push(gulp.src('./modules/processManager/pmApp.js')
        .pipe(gulp.dest(config.node.buildDir + "/modules/processManager/")));

    promiseArray.push(gulp.src('./modules/swagger/index.js')
        .pipe(gulp.dest(config.node.buildDir + "/modules/swagger/")));
    promiseArray.push(gulp.src('./modules/swagger/api/swagger.yaml')
        .pipe(gulp.dest(config.node.buildDir + "/modules/swagger/api/")));
    promiseArray.push(gulp.src('./modules/swagger/public/swagger.css')
        .pipe(gulp.dest(config.node.buildDir + "/modules/swagger/public")));

    promiseArray.push(gulp.src('./modules/system/public/robots.txt')
        .pipe(gulp.dest(config.node.buildDir + "/modules/system/public/")));


    promiseArray.push(gulp.src('./config/*.json')
        .pipe(gulp.dest(config.node.buildDir + "/config/")));

    promiseArray.push(gulp.src('./app.js')
        .pipe(gulp.dest(config.node.buildDir + "/")));
    promiseArray.push(gulp.src('./package.json')
        .pipe(gulp.dest(config.node.buildDir + "/")));

    promiseArray.push(gulp.src('./deploy/*')
        .pipe(gulp.dest(config.node.buildDir + "/deploy/")));

    promiseArray.push(gulp.src('./ingester/**')
        .pipe(gulp.dest(config.node.buildDir + "/ingester/")));

    promiseArray.push(gulp.src(
        [
            './modules/form/public/html/lformsRender.html',
            './modules/form/public/html/nativeRenderStandalone.html'
        ])
        .pipe(gulp.dest(config.node.buildDir + "/modules/form/public/html/")));

    promiseArray.push(gulp.src('./modules/form/public/assets/sdc/*')
        .pipe(gulp.dest(config.node.buildDir + "/modules/form/public/assets/sdc")));

    return Promise.all(promiseArray);


});

gulp.task('angularTemplates', function () {
    let module = 'embedded';
    let promiseArray = [];
    promiseArray.push(gulp
        .src("modules/" + module + "/public/js/angularTemplates.js")
        .pipe(gulp.dest("modules/" + module + "/public/js/bkup/")));
    promiseArray.push(gulp
        .src("modules/" + module + "/public/html/**/*.html")
        .pipe(templateCache({
            root: "/" + module + "/public/html",
            filename: "angularTemplates.js",
            module: module + "Templates",
            standalone: true
        }))
        .pipe(gulp.dest("modules/" + module + "/public/js/")));

    return Promise.all(promiseArray);
});

gulp.task('prepareVersion', ['copyCode'], (cb) => {
    git.revParse({args: '--short HEAD'}, function (err, hash) {
        fs.writeFile(config.node.buildDir + "/modules/system/node-js/version.js", "exports.version = '" + hash + "';",
            function (err) {
            if (err)  console.log("ERROR generating version.html: " + err);
            else console.log("generated " + config.node.buildDir + "/modules/system/node-js/version.js");
            cb();
        });
    });
});

gulp.task('usemin', ['copyCode', 'angularTemplates', 'webpack'], (cb) => {
    let promiseArray = [];

    [
        {folder: "./modules/system/views/", filename: "index.ejs"},
        {folder: "./modules/embedded/public/html/", filename: "index.html"},
        {folder: "./modules/form/public/html/", filename: "nativeRenderStandalone.html"}
    ].forEach(function (item) {
        promiseArray.push(new Promise(resolve => {
            gulp.src(item.folder + item.filename)
                .pipe(usemin({
                    jsAttributes: {
                        defer: true
                    },
                    assetsDir: "./modules/",
                    css: [minifyCss({target: "./modules/system/assets/css/vendor", rebase: true}), 'concat', rev()],
                    js: [uglify({mangle: false}), 'concat', rev()],
                    webp: ['concat', rev()]
                }))
                .pipe(gulp.dest(config.node.buildDir + '/modules/'))
                .on('end', function () {
                    gulp.src(config.node.buildDir + '/modules/' + item.filename)
                        .pipe(gulp.dest(config.node.buildDir + "/" + item.folder))
                        .on('end', resolve);
                });
        }));
    });
    Promise.all(promiseArray).then(cb);
});

gulp.task('webpack', ['thirdParty'], (cb) => {
    run('npm run build').exec(undefined,
        () => gulp.src('./modules/static/*.js')
            .pipe(gulp.dest(config.node.buildDir + "/modules/static/")).on('end', cb));
});

gulp.task('emptyTemplates', ['usemin'], (cb) => {
    let module = 'embedded';
    gulp.src("modules/" + module + "/public/js/bkup/angularTemplates.js")
            .pipe(gulp.dest("modules/" + module + "/public/js/")).on('end', cb);
});

gulp.task('es', function () {
    const elasticsearch = require('elasticsearch');

    let esClient = new elasticsearch.Client({
        hosts: config.elastic.hosts
    });

    esInit.indices.forEach(function (index) {
        esClient.indices.delete({index: index.indexName, timeout: "2s"}, function () {
        });
    });
    setTimeout(() => process.exit(0), 3000);
});

gulp.task('default', ['copyNpmDeps', 'copyCode', 'angularTemplates', 'prepareVersion',
    'usemin', 'emptyTemplates']);


