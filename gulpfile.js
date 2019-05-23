const data = require('gulp-data');
const fs = require('fs');
const git = require('gulp-git');
const gulp = require('gulp');

const {spawn, exec} = require('child_process');
const {parallel, series, task} = require('gulp');

const htmlmin = require('gulp-htmlmin');
const install = require('gulp-install');
const merge = require('merge-stream');
const minifyCss = require('gulp-clean-css');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const run = require('gulp-run');
const uglify = require('gulp-uglify');
const usemin = require('gulp-usemin');

const config = require('./server/system/parseConfig');
const esInit = require('./server/system/elasticSearchInit');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');

require('es6-promise').polyfill();

const buildDir = config.node.buildDir;

function nodeVersion(cb) {
    spawn('node', ['--version'], {stdio: 'inherit'})
        .on('exit', cb);
}

function npmCacheVerify(cb) {
    let p = exec('npm cache verify');
    p.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    p.stderr.on('data', function (data) {
        console.log('cacheVerify error: ' + data.toString());
    });

    p.on('exit', cb);
}

function npmInstall(cb) {
    let p = exec('npm install');
    p.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    p.stderr.on('data', function (data) {
        console.log('npmInstall error: ' + data.toString());
    });
    p.on('exit', cb);
}

function npmRebuildNodeSass(cb) {
    let p = exec('npm rebuild node-sass');
    p.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    p.stderr.on('data', function (data) {
        console.log('npmRebuildNodeSass error: ' + data.toString());
    });
    p.on('exit', cb);
}

function thirdParty() {
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
        './node_modules/whatwg-fetch/dist/fetch.umd.js'
    ]).pipe(gulp.dest('./dist/common/')));
    return merge(streamArr);
}

function createDist() {
    return gulp.src('./modules/common.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/common'));
}

function copyCode() {
    let streamArray = [];

    streamArray.push(gulp.src('./modules/_fhirApp/fhirAppLaunch.html')
        .pipe(gulp.dest(buildDir + '/modules/_fhirApp/')));

    ['cde', 'form', 'processManager', 'system', 'board'].forEach(module => {
        streamArray.push(gulp.src('./modules/' + module + '/!**!/!*.png')
            .pipe(gulp.dest(buildDir + '/modules/' + module + '/')));
        streamArray.push(gulp.src('./modules/' + module + '/!**!/!*.ico')
            .pipe(gulp.dest(buildDir + '/modules/' + module + '/')));
        streamArray.push(gulp.src('./modules/' + module + '/!**!/!*.gif')
            .pipe(gulp.dest(buildDir + '/modules/' + module + '/')));
        streamArray.push(gulp.src('./modules/' + module + '/views/!**!/!*.html')
            .pipe(gulp.dest(buildDir + '/modules/' + module + '/views/')));
        streamArray.push(gulp.src('./modules/' + module + '/views/bot/!*.ejs')
            .pipe(gulp.dest(buildDir + '/modules/' + module + '/views/bot/')));
    });

    ['supportedBrowsers.ejs', 'loginText.ejs'].forEach(function (file) {
        streamArray.push(gulp.src('./modules/system/views/' + file)
            .pipe(gulp.dest(buildDir + '/modules/system/views/')));
    });
    streamArray.push(gulp.src('./modules/processManager/pmApp.js')
        .pipe(gulp.dest(buildDir + '/modules/processManager/')));

    streamArray.push(gulp.src('./modules/swagger/index.js')
        .pipe(gulp.dest(buildDir + '/modules/swagger/')));
    streamArray.push(gulp.src('./modules/swagger/api/swagger.yaml')
        .pipe(gulp.dest(buildDir + '/modules/swagger/api/')));
    streamArray.push(gulp.src('./modules/swagger/public/swagger.css')
        .pipe(gulp.dest(buildDir + '/modules/swagger/public')));

    streamArray.push(gulp.src('./modules/system/public/robots.txt')
        .pipe(gulp.dest(buildDir + '/modules/system/public/')));


    streamArray.push(gulp.src('./config/!*.json')
        .pipe(gulp.dest(buildDir + '/config/')));

    streamArray.push(gulp.src('./app.js')
        .pipe(gulp.dest(buildDir + '/')));
    streamArray.push(gulp.src('./package.json')
        .pipe(gulp.dest(buildDir + '/')));

    streamArray.push(gulp.src('./deploy/!*')
        .pipe(gulp.dest(buildDir + '/deploy/')));

    streamArray.push(gulp.src('./ingester/!**')
        .pipe(gulp.dest(buildDir + '/ingester/')));

    streamArray.push(gulp.src('./modules/form/public/html/lformsRender.html')
        .pipe(gulp.dest(buildDir + '/modules/form/public/html/')));

    streamArray.push(gulp.src('./modules/form/public/assets/!**')
        .pipe(gulp.dest(buildDir + '/modules/form/public/assets/')));

    streamArray.push(gulp.src('./server/!**')
        .pipe(gulp.dest(buildDir + '/server/')));

    streamArray.push(gulp.src('./shared/!**')
        .pipe(gulp.dest(buildDir + '/shared/')));

    return merge(streamArray);
}

function copyNpmDeps() {
    return gulp.src('./package.json')
        .pipe(gulp.dest(buildDir))
        .pipe(install({npm: '--production'}));
}

function copyDist() {
    buildApp = () => run('npm run build').exec(),
        copyApp = () => gulp.src(['./dist/app/!**!/!*', '!./dist/app/cde.css', '!./dist/app/cde.js']).pipe(gulp.dest(buildDir + '/dist/app')),
        copyEmbed = () => gulp.src(['./dist/embed/!**!/!*', '!./dist/embed/embed.css', '!./dist/embed/embed.js']).pipe(gulp.dest(buildDir + '/dist/embed')),
        copyFhir = () => gulp.src(['./dist/fhir/!*', '!./dist/fhir/fhir.css', '!./dist/fhir/fhir.js']).pipe(gulp.dest(buildDir + '/dist/fhir')),
        copyNative = () => gulp.src(['./dist/native/!**!/!*', '!./dist/native/native.css', '!./dist/native/native.js']).pipe(gulp.dest(buildDir + '/dist/native')),
        copyHome = () => gulp.src('./modules/system/views/home-launch.ejs').pipe(gulp.dest(buildDir + '/modules/system/views')),
        copyLaunch = () => gulp.src('./dist/launch/!*').pipe(gulp.dest(buildDir + '/dist/launch')),
        copyServerless = () => gulp.src('./serverless-aws-java/!**!/!*').pipe(gulp.dest(buildDir + '/serverless-aws-java'))
}

function prepareVersion() {
    return git.revParse({args: '--short HEAD'}, function (err, hash) {
        fs.writeFile(buildDir + '/server/system/version.js', 'exports.version = "' + hash + '";',
            function (err) {
                if (err) console.log('ERROR generating version.html: ' + err);
                else console.log('generated ' + buildDir + '/server/system/version.js');
            });
    });
}

function _usemin() {
    let streamArray = [];
    [
        {folder: './modules/system/views/', filename: 'index.ejs'},
        {folder: './modules/_embedApp/', filename: 'embedApp.ejs'},
        {folder: './modules/_fhirApp/', filename: 'fhirApp.ejs'},
        {folder: './modules/_nativeRenderApp/', filename: 'nativeRenderApp.ejs'},
    ].forEach(item => {
        let useminOutputs = [];

        function outputFile(file) {
            useminOutputs.push(file.path.match(/(\\|\/)(app|embed|fhir|native)(\\|\/).*$/)[0].replace(/\\/g, '/'));
            return file;
        }

        function getCssLink(/*file*/) {
            return '"' + useminOutputs.filter(f => f.endsWith('.css'))[0] + '"';
        }

        function getJsLink(/*file*/) {
            return '"' + useminOutputs.filter(f => f.endsWith('.js'))[0] + '"';
        }

        let useminTask = gulp.src(item.folder + item.filename)
            .pipe(usemin({
                jsAttributes: {async: true},
                assetsDir: './dist/',
                css: [minifyCss(), 'concat', rev(), data(outputFile)],
                html: [htmlmin({
                    collapseInlineTagWhitespace: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    minifyJS: true,
                    minifyCSS: true,
                    processScripts: ['application/ld+json', 'text/javascript'],
                    processConditionalComments: true,
                    removeComments: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                })],
                js: ['concat', rev(), data(outputFile)],
                poly: [uglify({mangle: false}), 'concat', rev()],
            }))
            .pipe(replace('"/app/cde.css"', getCssLink))
            .pipe(replace('"/embed/embed.css"', getCssLink))
            .pipe(replace('"/fhir/fhir.css"', getCssLink))
            .pipe(replace('"/native/native.css"', getCssLink))
            .pipe(replace('"/native/native.js"', getJsLink))
            .pipe(gulp.dest(buildDir + '/dist/'));
        streamArray.push(useminTask);
        useminTask.on('end', function () {
            if (item.filename === 'index.ejs') {
                if (useminOutputs.length !== 2) {
                    console.log('useminOutputs:' + useminOutputs);
                    throw new Error('service worker creation failed');
                }
                gulp.src(buildDir + '/dist/app/sw.js') // does not preserve order
                    .pipe(replace('"/app/cde.css"', '"' + useminOutputs[0] + '"'))
                    .pipe(replace('"/app/cde.js"', '"' + useminOutputs[1] + '"'))
                    .pipe(replace('cde-cache-', 'cde-cache-v'))
                    .pipe(gulp.dest(buildDir + '/dist/app/'));
            }
        });
    });
    return merge(streamArray);
}

function copyUsemin() {
    let streamArray = [];
    [
        {folder: './modules/system/views/bot/', filename: '*.ejs'},
        {folder: './modules/system/views/', filename: 'index.ejs'},
        {folder: './modules/_embedApp/', filename: 'embedApp.ejs'},
        {folder: './modules/_nativeRenderApp/', filename: 'nativeRenderApp.ejs'},
        {folder: './modules/_fhirApp/', filename: 'fhirApp.ejs'}
    ].forEach(item => {
        streamArray.push(gulp.src(buildDir + '/dist/' + item.filename)
            .pipe(gulp.dest(buildDir + '/' + item.folder)));
    });
    return merge(streamArray);
}

function es() {
    const elasticsearch = require('elasticsearch');

    let esClient = new elasticsearch.Client({
        hosts: config.elastic.hosts
    });
    let allIndex = esInit.indices.map(i => i.indexName);
    console.log('allIndex ' + allIndex);
    return new Promise((resolve, reject) => {
        esClient.indices.delete({index: allIndex, timeout: '6s'}, err => err ? reject(err) : resolve());
    });
}

function buildHome() {
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
            assetsDir: './dist/',
            inlinecss: [minifyCss, 'concat'],
            inlinejs: [uglify({mangle: false}), 'concat'],
        }))
        .pipe(gulp.dest('./dist/'))
        .pipe(rename('home-launch.ejs'))
        .pipe(gulp.dest('./modules/system/views'));
}

function mongorestore(cb) {
    spawn('bash', ['restore-test-instance.sh'], {stdio: 'inherit'})
        .on('exit', cb);
}

function injectElastic(cb) {
    console.log('Start node app to inject');
    let p = spawn('node', ['app'], {stdio: 'inherit'});
    spawn('node', ['scripts/waitForIndex.js'], {stdio: 'inherit'})
        .on('exit', () => {
            p.kill();
            cb();
        })
}

function checkBundleSize(cb) {
    spawn('node', ['scripts/buildCheckSize.js'], {stdio: 'inherit'})
        .on('exit', cb);
}

/*


task('inject', series('mongoRestore', 'injectElastic'));
task('build', series('copyNpmDeps', 'prepareVersion', 'copyUsemin', 'checkDbConnection', 'checkBundleSize'));
task('default', series(parallel('info', 'install'), parallel('build', 'inject')));

*/

exports.nodeVersion = nodeVersion;
exports.npmCacheVerify = npmCacheVerify;
exports.npmInstall = npmInstall;
exports.npmRebuildNodeSass = npmRebuildNodeSass;
exports.thirdParty = thirdParty;
exports.createDist = createDist;
exports.copyCode = copyCode;
exports.copyNpmDeps = copyNpmDeps;
exports.copyDist = copyDist;
exports.default = series(nodeVersion, npmCacheVerify, npmInstall, npmRebuildNodeSass, thirdParty, createDist, copyCode, copyNpmDeps, copyDist, prepareVersion);
