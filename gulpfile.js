const config = require('./server/system/parseConfig');
const data = require('gulp-data');
const del = require('del');
const esInit = require('./server/system/elasticSearchInit');
const fs = require('fs');
const git = require('gulp-git');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const install = require('gulp-install');
const merge = require('merge-stream');
const minifyCss = require('gulp-clean-css');
const replace = require('gulp-replace');
const rename = require("gulp-rename");
const rev = require('gulp-rev');
const run = require('gulp-run');
const uglify = require('gulp-uglify');
const usemin = require('gulp-usemin');

require('es6-promise').polyfill();

gulp.task('npm', function _npm() {
    run('node --version').exec();
    return gulp.src(['./package.json'])
        .pipe(install());
});

gulp.task('npmRebuildNodeSass', gulp.series('npm', function _npmRebuildNodeSass() {
    return run('npm rebuild node-sass').exec();
}));

gulp.task('thirdParty', gulp.series('npmRebuildNodeSass', function _thirdParty() {
    let streamArr = [];

    streamArr.push(gulp.src('./node_modules/core-js/client/core.min.js')
        .pipe(replace('//# sourceMappingURL=core.min.js.map', ''))
        .pipe(gulp.dest('./dist/common/')));
    streamArr.push(gulp.src('./node_modules/intl/dist/Intl.min.js')
        .pipe(replace('//# sourceMappingURL=Intl.min.js.map', ''))
        .pipe(gulp.dest('./dist/common/')));
    streamArr.push(gulp.src('./node_modules/web-animations-js/web-animations.min.js')
        .pipe(replace('//# sourceMappingURL=web-animations.min.js.map', ''))
        .pipe(gulp.dest('./dist/common/')));
    streamArr.push(gulp.src([
        './node_modules/classlist.js/classList.min.js',
        './node_modules/intl/locale-data/jsonp/en.js',
    ]).pipe(gulp.dest('./dist/common/')));

    return merge(streamArr);
}));

gulp.task('createDist', gulp.series('thirdParty', function _createDist() {
    return gulp.src('./modules/cde/public/css/style.css') // TODO: move style.css to modules/standard_theme.css
        .pipe(gulp.dest('./dist/common'));
}));

gulp.task('copyCode', function _copyCode() {
    let streamArray = [];

    ['cde', 'form', 'processManager', 'system', 'board'].forEach(module => {
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

    streamArray.push(gulp.src('./modules/form/public/html/lformsRender.html')
        .pipe(gulp.dest(config.node.buildDir + "/modules/form/public/html/")));

    streamArray.push(gulp.src('./modules/form/public/assets/**')
        .pipe(gulp.dest(config.node.buildDir + "/modules/form/public/assets/")));

    streamArray.push(gulp.src('./server/**')
        .pipe(gulp.dest(config.node.buildDir + "/server/")));

    streamArray.push(gulp.src('./shared/**')
        .pipe(gulp.dest(config.node.buildDir + "/shared/")));

    return merge(streamArray);
});

gulp.task('copyNpmDeps', gulp.series('copyCode', 'npmRebuildNodeSass', function _copyNpmDeps() {
    run('npm -v').exec();
    return gulp.src('./package.json')
        .pipe(gulp.dest(config.node.buildDir))
        .pipe(install({npm: '--production'}));
}));

gulp.task('prepareVersion', gulp.series('copyCode', function _prepareVersion() {
    return git.revParse({args: '--short HEAD'}, function (err, hash) {
        fs.writeFile(config.node.buildDir + "/server/system/version.js", "exports.version = '" + hash + "';",
            function (err) {
                if (err) console.log("ERROR generating version.html: " + err);
                else console.log("generated " + config.node.buildDir + "/server/system/version.js");
            });
    });
}));

gulp.task('copyDist', gulp.series('createDist',
    gulp.parallel(
        buildApp = () => run('npm run buildApp').exec(),
        buildNative = () => run('npm run buildNative').exec(),
        buildEmbed = () => run('npm run buildEmbed').exec(),
        buildFhir = () => run('npm run buildFhir').exec())
    , copyApp = () => gulp.src('./dist/app/**/*').pipe(gulp.dest(config.node.buildDir + '/dist/app'))
    , copyEmbed = () => gulp.src('./dist/embed/**/*').pipe(gulp.dest(config.node.buildDir + '/dist/embed'))
    , copyFhir = () => gulp.src('./dist/fhir/*').pipe(gulp.dest(config.node.buildDir + '/dist/fhir'))
    , copyNative = () => gulp.src('./dist/native/**/*').pipe(gulp.dest(config.node.buildDir + '/dist/native'))
    , copyHome = () => gulp.src('./modules/system/views/home-launch.ejs').pipe(gulp.dest(config.node.buildDir + '/modules/system/views'))
    , copyLaunch = () => gulp.src('./dist/launch/*').pipe(gulp.dest(config.node.buildDir + '/dist/launch'))
));

gulp.task('usemin', gulp.series('copyDist', function _usemin() {
    let streamArray = [];
    [
        {folder: "./modules/system/views/", filename: "index.ejs"},
        {folder: "./modules/system/views/", filename: "index-legacy.ejs"},
        {folder: "./modules/_embedApp/public/html/", filename: "index.html"},
        {folder: "./modules/_fhirApp/", filename: "fhirApp.html"},
        {folder: "./modules/_nativeRenderApp/", filename: "nativeRenderApp.html"},
    ].forEach(item => {
        let useminOutputs = [];

        function outputFile(file) {
            let index = file.path.indexOf('/app/'); // linux
            if (index === -1) {
                index = file.path.indexOf('\\app\\'); // windows
            }
            useminOutputs.push('/app/' + file.path.substring(index + 5));
            return file;
        }

        let useminTask = gulp.src(item.folder + item.filename)
            .pipe(usemin({
                jsAttributes: {
                    defer: false
                },
                assetsDir: "./dist/",
                webpcss: ['concat', rev(), data(outputFile)],
                webpcssLegacy: ['concat', rev()],
                css: [minifyCss({target: "./dist/app", rebase: true}), 'concat', rev(), data(outputFile)],
                cssLegacy: [minifyCss({target: "./dist/app", rebase: true}), 'concat', rev()],
                poly: [uglify({mangle: false}), 'concat', rev()],
                polyLegacy: [uglify({mangle: false}), 'concat', rev()],
                webp: ['concat', rev(), data(outputFile)],
                webpLegacy: ['concat', rev()]
            }))
            .pipe(gulp.dest(config.node.buildDir + '/dist/'));
        streamArray.push(useminTask);
        useminTask.on('end', function () {
            if (item.filename === 'index.ejs') {
                if (useminOutputs.length !== 3) {
                    console.log("useminOutputs:" + useminOutputs);
                    throw new Error('service worker creation failed');
                }
                gulp.src(config.node.buildDir + '/dist/app/sw.js') // does not preserve order
                    .pipe(replace('"/app/cde.css"', '"' + useminOutputs[0] + '"'))
                    .pipe(replace('"/app/styles-cde.css"', '"' + useminOutputs[1] + '"'))
                    .pipe(replace('"/app/cde.js"', '"' + useminOutputs[2] + '"'))
                    .pipe(replace('cde-cache-', 'cde-cache-v'))
                    .pipe(gulp.dest(config.node.buildDir + '/dist/app/'));
            }
        });
    });
    return merge(streamArray);
}));

gulp.task('copyUsemin', gulp.series('usemin', function _usemin() {
    let streamArray = [];
    [
        {folder: "./modules/system/views/bot/", filename: "*.ejs"},
        {folder: "./modules/system/views/", filename: "index.ejs"},
        {folder: "./modules/system/views/", filename: "index-legacy.ejs"},
        {folder: "./modules/_embedApp/public/html/", filename: "index.html"},
        {folder: "./modules/_nativeRenderApp/", filename: "nativeRenderApp.html"},
        {folder: "./modules/_fhirApp/", filename: "fhirApp.html"}
    ].forEach(item => {
        streamArray.push(gulp.src(config.node.buildDir + '/dist/' + item.filename)
            .pipe(gulp.dest(config.node.buildDir + "/" + item.folder)));
    });
    return merge(streamArray);
}));

gulp.task('es', function _es() {
    const elasticsearch = require('elasticsearch');

    let esClient = new elasticsearch.Client({
        hosts: config.elastic.hosts
    });
    let allIndex = esInit.indices.map(i => i.indexName);
    return new Promise(function (resolve) {
        esClient.indices.delete({index: allIndex, timeout: "6s"}, () => {
            resolve();
        });
    });
});

// Procedure calling task in README
gulp.task('buildHome', function _buildHome() {
    return del(['dist/launch/*.png']).then(() => {
        gulp.src('./dist/app/*.png')
            .pipe(gulp.dest('dist/launch'));
        gulp.src('./dist/app/*.webp')
            .pipe(gulp.dest('dist/launch'));
        return gulp.src('./modules/system/views/home.ejs')
            .pipe(replace('<NIHCDECONTENT/>', fs.readFileSync('./modules/_app/staticHome/nihcde.html', {encoding: 'utf8'})))
            .pipe(usemin({
                jsAttributes: {
                    async: true,
                    defer: false
                },
                html: [htmlmin({
                    collapseInlineTagWhitespace: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    minifyJS: true,
                    minifyCSS: true,
                    processScripts: ['application/ld+json'],
                    processConditionalComments: true,
                    removeComments: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                })],
                assetsDir: "./dist/",
                inlinecss: [minifyCss, 'concat'],
                inlinejs: [uglify({mangle: false}), 'concat'],
            }))
            .pipe(gulp.dest('./dist/'))
            .pipe(rename('home-launch.ejs'))
            .pipe(gulp.dest('./modules/system/views'));
    });
});
gulp.task('checkDbConnection', function _buildHome() {
    return new Promise(function (resolve, reject) {
        let isRequireDbConnection = !!require.cache[require.resolve('./server/system/connections')];
        if (isRequireDbConnection) reject("DB connection cannot be included in gulp.");
        else resolve();
    });
});
gulp.task('default', gulp.series('copyNpmDeps', 'prepareVersion', 'copyUsemin', 'checkDbConnection'));


