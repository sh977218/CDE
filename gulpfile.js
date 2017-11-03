const gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    config = require('./modules/system/node-js/parseConfig'),
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    minifyCss = require('gulp-clean-css'),
    bower = require('gulp-bower'),
    install = require('gulp-install'),
    wiredep = require('gulp-wiredep'),
    fs = require('fs'),
    esInit = require('./modules/system/node-js/elasticSearchInit'),
    git = require('gulp-git'),
    run = require('gulp-run'),
    merge = require('merge-stream')
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
    let streamArr = [];

    streamArr.push(gulp.src('./node_modules/core-js/client/shim.min.js')
        .pipe(gulp.dest('./modules/static/')));
    streamArr.push(gulp.src('./node_modules/classlist.js/classList.min.js')
        .pipe(gulp.dest('./modules/static/')));
    streamArr.push(gulp.src('./node_modules/html5-formdata/formdata.js')
        .pipe(gulp.dest('./modules/static/')));
    streamArr.push(gulp.src('./node_modules/js-polyfills/typedarray.js')
        .pipe(gulp.dest('./modules/static/')));
    streamArr.push(gulp.src('./node_modules/Blob.js/Blob.js')
        .pipe(gulp.dest('./modules/static/')));
    streamArr.push(gulp.src('./node_modules/intl/locale-data/jsonp/en.js')
        .pipe(gulp.dest('./modules/static/')));
    streamArr.push(gulp.src('./node_modules/intl/dist/Intl.min.js')
        .pipe(gulp.dest('./modules/static/')));

    return merge(streamArr);
});

gulp.task('lhc-wiredep', ['bower'], function () {
    return gulp.src("./modules/form/public/html/lformsRender.html")
        .pipe(wiredep({
            directory: "modules/components"
            , ignorePath: "../../.."
        }))
        .pipe(gulp.dest("./modules/form/public/html"));
});

gulp.task('nativefollow-wiredep', ['bower'], function () {
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

    let streamArray = [];

    ['cde', 'form', 'processManager', 'system', 'board'].forEach(function (module) {
        streamArray.push(gulp.src('./modules/' + module + '/node-js/**/*')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/node-js/')));
        streamArray.push(gulp.src('./modules/' + module + '/shared/**/*')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/shared/')));
        streamArray.push(gulp.src('./modules/' + module + '/**/*.png')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/')));
        streamArray.push(gulp.src('./modules/' + module + '/**/*.ico')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/')));
        streamArray.push(gulp.src('./modules/' + module + '/**/*.gif')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/')));
        streamArray.push(gulp.src('./modules/' + module + '/views/**/*.html')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/views/')));
        streamArray.push(gulp.src('./modules/' + module + '/views/bot/*.ejs')
            .pipe(gulp.dest(config.node.buildDir + "/modules/" + module + '/views/bot/')));
    });

    ['supportedBrowsers.ejs', 'loginText.ejs'].forEach(function (file) {
        streamArray.push(gulp.src('./modules/system/views/' + file)
            .pipe(gulp.dest(config.node.buildDir + "/modules/system/views/")));
    });

    streamArray.push(gulp.src('./modules/components/**/*')
        .pipe(gulp.dest(config.node.buildDir + "/modules/components/")));

    streamArray.push(gulp.src('./modules/processManager/pmApp.js')
        .pipe(gulp.dest(config.node.buildDir + "/modules/processManager/")));

    streamArray.push(gulp.src('./modules/swagger/index.js')
        .pipe(gulp.dest(config.node.buildDir + "/modules/swagger/")));
    streamArray.push(gulp.src('./modules/swagger/api/swagger.yaml')
        .pipe(gulp.dest(config.node.buildDir + "/modules/swagger/api/")));
    streamArray.push(gulp.src('./modules/swagger/public/swagger.css')
        .pipe(gulp.dest(config.node.buildDir + "/modules/swagger/public")));

    streamArray.push(gulp.src('./modules/system/public/robots.txt')
        .pipe(gulp.dest(config.node.buildDir + "/modules/system/public/")));


    streamArray.push(gulp.src('./config/*.json')
        .pipe(gulp.dest(config.node.buildDir + "/config/")));

    streamArray.push(gulp.src('./app.js')
        .pipe(gulp.dest(config.node.buildDir + "/")));
    streamArray.push(gulp.src('./package.json')
        .pipe(gulp.dest(config.node.buildDir + "/")));

    streamArray.push(gulp.src('./deploy/*')
        .pipe(gulp.dest(config.node.buildDir + "/deploy/")));

    streamArray.push(gulp.src('./ingester/**')
        .pipe(gulp.dest(config.node.buildDir + "/ingester/")));

    streamArray.push(gulp.src(
        [
            './modules/form/public/html/lformsRender.html',
            './modules/form/public/html/nativeRenderStandalone.html'
        ])
        .pipe(gulp.dest(config.node.buildDir + "/modules/form/public/html/")));

    streamArray.push(gulp.src('./modules/form/public/assets/**')
        .pipe(gulp.dest(config.node.buildDir + "/modules/form/public/assets/")));

    return merge(streamArray);


});

gulp.task('prepareVersion', ['copyCode'], function () {
    git.revParse({args: '--short HEAD'}, function (err, hash) {
        fs.writeFile(config.node.buildDir + "/modules/system/node-js/version.js", "exports.version = '" + hash + "';",
            function (err) {
                if (err) console.log("ERROR generating version.html: " + err);
                else console.log("generated " + config.node.buildDir + "/modules/system/node-js/version.js");
            });
    });
});

gulp.task('webpack-app', ['thirdParty'], () => {
    return run('npm run buildApp').exec();
});

gulp.task('webpack-native', ['thirdParty'], () => {
    return run('npm run buildNative').exec();
});

gulp.task('webpack-embed', ['thirdParty'], () => {
    return run('npm run buildEmbed').exec();
});

gulp.task('copyWebpack', ['webpack-app', 'webpack-native', 'webpack-embed'], () => {
    return gulp.src('./modules/static/*.js')
        .pipe(gulp.dest(config.node.buildDir + "/modules/static/"));
});

gulp.task('usemin', ['copyCode', 'copyWebpack'], function () {
    let streamArray = [];
    [
        {folder: "./modules/system/views/", filename: "index.ejs"},
        {folder: "./modules/embedded/public/html/", filename: "index.html"},
        {folder: "./modules/form/public/html/", filename: "nativeRenderStandalone.html"}
    ].forEach(item => {
        streamArray.push(
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
        );
    });
    return merge(streamArray);
});

gulp.task('copyUsemin', ['usemin'], function () {
    let streamArray = [];
    [
        {folder: "./modules/system/views/bot/"},
        {folder: "./modules/system/views/", filename: "index.ejs"},
        {folder: "./modules/embedded/public/html/", filename: "index.html"},
        {folder: "./modules/form/public/html/", filename: "nativeRenderStandalone.html"}
    ].forEach(item => {
        streamArray.push(gulp.src(config.node.buildDir + '/modules/' + item.filename)
            .pipe(gulp.dest(config.node.buildDir + "/" + item.folder)));
    });
    return merge(streamArray);
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

gulp.task('default', ['copyNpmDeps', 'copyCode', 'prepareVersion', 'copyUsemin', 'emptyTemplates']);


