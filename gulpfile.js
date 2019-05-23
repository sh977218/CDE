const data = require('gulp-data');
const fs = require('fs');
const git = require('gulp-git');

const {dest, src} = require('gulp');
const {spawn, exec} = require('child_process');
const {parallel, series, task} = require('gulp');

const htmlmin = require('gulp-htmlmin');
const install = require('gulp-install');
const merge = require('merge-stream');
const minifyCss = require('gulp-clean-css');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const uglify = require('gulp-uglify');
const usemin = require('gulp-usemin');

const config = require('./server/system/parseConfig');
const esInit = require('./server/system/elasticSearchInit');

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

function npmInstall() {
    /*    let p = exec('npm install');
        p.stdout.on('data', function (data) {
            console.log(data.toString());
        });

        p.stderr.on('data', function (data) {
            console.log('npmInstall error: ' + data.toString());
        });
        p.on('exit', cb);*/
    return src(['./package.json']).pipe(install());
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
    streamArr.push(src('./node_modules/core-js/client/core.min.js')
        .pipe(replace('//# sourceMappingURL=core.min.js.map', ''))
        .pipe(dest('./dist/common/')));
    streamArr.push(src('./node_modules/intl/dist/Intl.min.js')
        .pipe(replace('//# sourceMappingURL=Intl.min.js.map', ''))
        .pipe(dest('./dist/common/')));
    streamArr.push(src('./node_modules/web-animations-js/web-animations.min.js')
        .pipe(replace('//# sourceMappingURL=web-animations.min.js.map', ''))
        .pipe(dest('./dist/common/')));
    streamArr.push(src([
        './node_modules/classlist.js/classList.min.js',
        './node_modules/intl/locale-data/jsonp/en.js',
        './node_modules/whatwg-fetch/dist/fetch.umd.js'
    ]).pipe(dest('./dist/common/')));
    return merge(streamArr);
}

function createDist() {
    const sass = require('gulp-sass');
    sass.compiler = require('node-sass'); // delay using node-sass until npmRebuildNodeSass is done
    return src('./modules/common.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(dest('./dist/common'));
}

function copyCode() {
    let streamArray = [];

    streamArray.push(src('./modules/_fhirApp/fhirAppLaunch.html')
        .pipe(dest(buildDir + '/modules/_fhirApp/')));

    ['cde', 'form', 'processManager', 'system', 'board'].forEach(module => {
        streamArray.push(src('./modules/' + module + '/!**!/!*.png')
            .pipe(dest(buildDir + '/modules/' + module + '/')));
        streamArray.push(src('./modules/' + module + '/!**!/!*.ico')
            .pipe(dest(buildDir + '/modules/' + module + '/')));
        streamArray.push(src('./modules/' + module + '/!**!/!*.gif')
            .pipe(dest(buildDir + '/modules/' + module + '/')));
        streamArray.push(src('./modules/' + module + '/views/!**!/!*.html')
            .pipe(dest(buildDir + '/modules/' + module + '/views/')));
        streamArray.push(src('./modules/' + module + '/views/bot/!*.ejs')
            .pipe(dest(buildDir + '/modules/' + module + '/views/bot/')));
    });

    ['supportedBrowsers.ejs', 'loginText.ejs'].forEach(function (file) {
        streamArray.push(src('./modules/system/views/' + file)
            .pipe(dest(buildDir + '/modules/system/views/')));
    });
    streamArray.push(src('./modules/processManager/pmApp.js')
        .pipe(dest(buildDir + '/modules/processManager/')));

    streamArray.push(src('./modules/swagger/index.js')
        .pipe(dest(buildDir + '/modules/swagger/')));
    streamArray.push(src('./modules/swagger/api/swagger.yaml')
        .pipe(dest(buildDir + '/modules/swagger/api/')));
    streamArray.push(src('./modules/swagger/public/swagger.css')
        .pipe(dest(buildDir + '/modules/swagger/public')));

    streamArray.push(src('./modules/system/public/robots.txt')
        .pipe(dest(buildDir + '/modules/system/public/')));


    streamArray.push(src('./config/!*.json')
        .pipe(dest(buildDir + '/config/')));

    streamArray.push(src('./app.js')
        .pipe(dest(buildDir + '/')));
    streamArray.push(src('./package.json')
        .pipe(dest(buildDir + '/')));

    streamArray.push(src('./deploy/!*')
        .pipe(dest(buildDir + '/deploy/')));

    streamArray.push(src('./ingester/!**')
        .pipe(dest(buildDir + '/ingester/')));

    streamArray.push(src('./modules/form/public/html/lformsRender.html')
        .pipe(dest(buildDir + '/modules/form/public/html/')));

    streamArray.push(src('./modules/form/public/assets/!**')
        .pipe(dest(buildDir + '/modules/form/public/assets/')));

    streamArray.push(src('./server/!**')
        .pipe(dest(buildDir + '/server/')));

    streamArray.push(src('./shared/!**')
        .pipe(dest(buildDir + '/shared/')));

    return merge(streamArray);
}

function copyNpmDeps() {
    return src('./package.json')
        .pipe(dest(buildDir))
        .pipe(install({npm: '--production'}));
}

function build(cb) {
    let p = exec('npm run build');
    p.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    p.stderr.on('data', function (data) {
        console.log('build error: ' + data.toString());
    });
    p.on('exit', cb);
}

function copyApp() {
    return src(['./dist/app/!**!/!*', '!./dist/app/cde.css', '!./dist/app/cde.js']).pipe(dest(buildDir + '/dist/app'));
}

function copyEmbed() {
    return src(['./dist/embed/!**!/!*', '!./dist/embed/embed.css', '!./dist/embed/embed.js']).pipe(dest(buildDir + '/dist/embed'));
}

function copyFhir() {
    return src(['./dist/fhir/!*', '!./dist/fhir/fhir.css', '!./dist/fhir/fhir.js']).pipe(dest(buildDir + '/dist/fhir'));
}

function copyNative() {
    return src(['./dist/native/!**!/!*', '!./dist/native/native.css', '!./dist/native/native.js']).pipe(dest(buildDir + '/dist/native'));
}

function copyHome() {
    return src('./modules/system/views/home-launch.ejs').pipe(dest(buildDir + '/modules/system/views'));
}

function copyLaunch() {
    return src('./dist/launch/!*').pipe(dest(buildDir + '/dist/launch'));
}

function copyServerless() {
    return src('./serverless-aws-java/!**!/!*').pipe(dest(buildDir + '/serverless-aws-java'))
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

        let useminTask = src(item.folder + item.filename)
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
            .pipe(dest(buildDir + '/dist/'));
        streamArray.push(useminTask);
        useminTask.on('end', function () {
            if (item.filename === 'index.ejs') {
                if (useminOutputs.length !== 2) {
                    console.log('useminOutputs:' + useminOutputs);
                    throw new Error('service worker creation failed');
                }
                src(buildDir + '/dist/app/sw.js') // does not preserve order
                    .pipe(replace('"/app/cde.css"', '"' + useminOutputs[0] + '"'))
                    .pipe(replace('"/app/cde.js"', '"' + useminOutputs[1] + '"'))
                    .pipe(replace('cde-cache-', 'cde-cache-v'))
                    .pipe(dest(buildDir + '/dist/app/'));
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
        streamArray.push(src(buildDir + '/dist/' + item.filename)
            .pipe(dest(buildDir + '/' + item.folder)));
    });
    return merge(streamArray);
}

function es(cb) {
    const elasticsearch = require('elasticsearch');

    let esClient = new elasticsearch.Client({
        hosts: config.elastic.hosts
    });
    let allIndex = esInit.indices.map(i => i.indexName);
    console.log('allIndex ' + allIndex);
    esClient.indices.delete({index: allIndex, timeout: '6s'}, () => {
        cb();
    });
}

// Procedure calling task in README
function buildHome() {
    return src('./modules/system/views/home.ejs')
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
        .pipe(dest('./dist/'))
        .pipe(rename('home-launch.ejs'))
        .pipe(dest('./modules/system/views'));
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

exports.es = es;
exports.npmInstall = npmInstall;
exports.npmRebuildNodeSass = npmRebuildNodeSass;
exports.thirdParty = thirdParty;
exports.createDist = createDist;
exports.copyCode = copyCode;
exports.copyNpmDeps = copyNpmDeps;
exports.prepareVersion = prepareVersion;


exports.buildHome = series(
    parallel(
        nodeVersion,
        series(npmCacheVerify, npmInstall)
    ),
    buildHome
);
exports.mongorestore = series(
    parallel(
        nodeVersion,
        series(npmCacheVerify, npmInstall)
    ),
    mongorestore
);
exports.injectElastic = series(
    parallel(
        nodeVersion,
        series(npmCacheVerify, npmInstall)
    ),
    injectElastic
);

exports.default = series(
    parallel(
        nodeVersion,
        series(npmCacheVerify, npmInstall)
    ),
    parallel(
        series(mongorestore, injectElastic),
        series(
            copyCode,
            npmRebuildNodeSass,
            copyNpmDeps,
            buildHome,
            thirdParty,
            createDist,
            build,
            copyApp,
            copyNative,
            copyEmbed,
            copyFhir,
            copyHome,
            copyLaunch,
            copyServerless,
            _usemin,
            copyUsemin,
            checkBundleSize,
            prepareVersion
        )
    )
);
