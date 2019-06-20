import { resolve } from 'path';
import { config } from './server/system/parseConfig';

const { readFileSync, writeFile } = require('fs');
const gulp = require('gulp');
const minifyCss = require('gulp-clean-css');
const data = require('gulp-data');
const { revParse } = require('gulp-git');
const htmlmin = require('gulp-htmlmin');
const install = require('gulp-install');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const rev = require('gulp-rev');
const run = require('gulp-run');
const merge = require('merge-stream');
const uglify = require('gulp-uglify');
const usemin = require('gulp-usemin');

require('es6-promise').polyfill();

const APP_DIR = __dirname;
const BUILD_DIR = resolve(APP_DIR, config.node.buildDir);
const runOptions = {cwd: APP_DIR};

gulp.task('npm', function npm() {
    run('node --version', runOptions).exec();
    run('npm cache verify', runOptions).exec();
    run('mongo --version', runOptions).exec();
    return gulp.src([resolve(APP_DIR, './package.json')])
        .pipe(install());
});

gulp.task('npmRebuildNodeSass', ['npm'], function npmRebuildNodeSass() {
    return run('npm rebuild node-sass', runOptions).exec();
});

gulp.task('copyThirdParty', ['npmRebuildNodeSass'], function copyThirdParty() {
    let streamArr = [];

    streamArr.push(gulp.src(resolve(APP_DIR, './node_modules/core-js/client/core.min.js'))
        .pipe(replace('//# sourceMappingURL=core.min.js.map', ''))
        .pipe(gulp.dest(resolve(APP_DIR, './dist/common/'))));
    streamArr.push(gulp.src(resolve(APP_DIR, './node_modules/intl/dist/Intl.min.js'))
        .pipe(replace('//# sourceMappingURL=Intl.min.js.map', ''))
        .pipe(gulp.dest(resolve(APP_DIR, './dist/common/'))));
    streamArr.push(gulp.src(resolve(APP_DIR, './node_modules/web-animations-js/web-animations.min.js'))
        .pipe(replace('//# sourceMappingURL=web-animations.min.js.map', ''))
        .pipe(gulp.dest(resolve(APP_DIR, './dist/common/'))));
    streamArr.push(gulp.src([
        resolve(APP_DIR, './node_modules/classlist.js/classList.min.js'),
        resolve(APP_DIR, './node_modules/intl/locale-data/jsonp/en.js'),
        resolve(APP_DIR, './node_modules/whatwg-fetch/dist/fetch.umd.js')
    ]).pipe(gulp.dest(resolve(APP_DIR, './dist/common/'))));

    return merge(streamArr);
});

gulp.task('createDist', ['copyThirdParty'], function createDist() {
    const sass = require('gulp-sass');
    sass.compiler = require('node-sass'); // delay using node-sass until npmRebuildNodeSass is done
    return gulp.src(resolve(APP_DIR, './modules/common.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(resolve(APP_DIR, './dist/common')));
});

gulp.task('copyCode', function copyCode() {
    let streamArray: any[] = [];

    streamArray.push(gulp.src(resolve(APP_DIR, './modules/_fhirApp/fhirAppLaunch.html'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/_fhirApp/')));

    ['cde', 'form', 'processManager', 'system', 'board'].forEach(module => {
        streamArray.push(gulp.src(resolve(APP_DIR, './modules/' + module + '/**/*.png'))
            .pipe(gulp.dest(BUILD_DIR + '/modules/' + module + '/')));
        streamArray.push(gulp.src(resolve(APP_DIR, './modules/' + module + '/**/*.ico'))
            .pipe(gulp.dest(BUILD_DIR + '/modules/' + module + '/')));
        streamArray.push(gulp.src(resolve(APP_DIR, './modules/' + module + '/**/*.gif'))
            .pipe(gulp.dest(BUILD_DIR + '/modules/' + module + '/')));
        streamArray.push(gulp.src(resolve(APP_DIR, './modules/' + module + '/views/**/*.html'))
            .pipe(gulp.dest(BUILD_DIR + '/modules/' + module + '/views/')));
        streamArray.push(gulp.src(resolve(APP_DIR, './modules/' + module + '/views/bot/*.ejs'))
            .pipe(gulp.dest(BUILD_DIR + '/modules/' + module + '/views/bot/')));
    });

    ['supportedBrowsers.ejs', 'loginText.ejs'].forEach(function (file) {
        streamArray.push(gulp.src(resolve(APP_DIR, './modules/system/views/' + file))
            .pipe(gulp.dest(BUILD_DIR + '/modules/system/views/')));
    });
    streamArray.push(gulp.src(resolve(APP_DIR, './modules/processManager/pmApp.js'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/processManager/')));

    streamArray.push(gulp.src('./modules/swagger/index.js')
        .pipe(gulp.dest(BUILD_DIR + '/modules/swagger/')));
    streamArray.push(gulp.src(resolve(APP_DIR, './modules/swagger/api/swagger.yaml'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/swagger/api/')));
    streamArray.push(gulp.src(resolve(APP_DIR, './modules/swagger/public/swagger.css'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/swagger/public')));

    streamArray.push(gulp.src(resolve(APP_DIR, './modules/system/public/robots.txt'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/system/public/')));


    streamArray.push(gulp.src(resolve(APP_DIR, './config/*.json'))
        .pipe(gulp.dest(BUILD_DIR + '/config/')));

    streamArray.push(gulp.src(resolve(APP_DIR, './package.json'))
        .pipe(replace('"startJs": "node ./buildNode/app.js",', '"startJs": "node app.js",'))
        .pipe(gulp.dest(BUILD_DIR + '/')));

    streamArray.push(gulp.src(resolve(APP_DIR, './deploy/*'))
        .pipe(gulp.dest(BUILD_DIR + '/deploy/')));

    streamArray.push(gulp.src(resolve(APP_DIR, './ingester/**'))
        .pipe(gulp.dest(BUILD_DIR + '/ingester/')));

    streamArray.push(gulp.src(resolve(APP_DIR, './modules/form/public/html/lformsRender.html'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/form/public/html/')));

    streamArray.push(gulp.src(resolve(APP_DIR, './modules/form/public/assets/**'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/form/public/assets/')));

    // from buildNode (required)
    streamArray.push(gulp.src('./app.js')
        .pipe(replace('APP_DIR = __dirname + "/.."', 'APP_DIR = __dirname'))
        .pipe(gulp.dest(BUILD_DIR + '/')));
    streamArray.push(gulp.src('./server/**')
        .pipe(gulp.dest(BUILD_DIR + '/server/')));
    streamArray.push(gulp.src('./shared/**')
        .pipe(gulp.dest(BUILD_DIR + '/shared/')));

    return merge(streamArray);
});

gulp.task('copyNpmDeps', ['copyCode', 'npmRebuildNodeSass'], function copyNpmDeps() {
    run('npm -v', runOptions).exec();
    return gulp.src(resolve(BUILD_DIR, './package.json'))
        .pipe(gulp.dest(BUILD_DIR))
        .pipe(install({npm: '--production'}));
});

gulp.task('prepareVersion', ['copyCode'], function prepareVersion() {
    return revParse({args: '--short HEAD'}, function (err: any, hash: string) {
        writeFile(BUILD_DIR + '/server/system/version.js', 'exports.version = "' + hash + '";',
            function (err: any) {
                if (err) console.log('ERROR generating version.html: ' + err);
                else console.log('generated ' + BUILD_DIR + '/server/system/version.js');
            });
    });
});

gulp.task('buildDist', ['createDist'], function copyDist() {
    return merge([
        run('npm run buildAppJs', runOptions).exec(),
        run('npm run buildNativeJs', runOptions).exec(),
        run('npm run buildEmbedJs', runOptions).exec(),
        run('npm run buildFhirJs', runOptions).exec(),
        run('npm run buildFnAwsJava', runOptions).exec()
    ]);
});

gulp.task('copyDist', ['buildDist'], function copyDist() {
    return merge([
        gulp.src([resolve(APP_DIR, './dist/app/**/*'), resolve(APP_DIR, '!./dist/app/cde.css'), resolve(APP_DIR, '!./dist/app/cde.js')]).pipe(gulp.dest(BUILD_DIR + '/dist/app')),
        gulp.src([resolve(APP_DIR, './dist/embed/**/*'), resolve(APP_DIR, '!./dist/embed/embed.css'), resolve(APP_DIR, '!./dist/embed/embed.js')]).pipe(gulp.dest(BUILD_DIR + '/dist/embed')),
        gulp.src([resolve(APP_DIR, './dist/fhir/*'), resolve(APP_DIR, '!./dist/fhir/fhir.css'), resolve(APP_DIR, '!./dist/fhir/fhir.js')]).pipe(gulp.dest(BUILD_DIR + '/dist/fhir')),
        gulp.src([resolve(APP_DIR, './dist/native/**/*'), resolve(APP_DIR, '!./dist/native/native.css'), resolve(APP_DIR, '!./dist/native/native.js')]).pipe(gulp.dest(BUILD_DIR + '/dist/native')),
        gulp.src(resolve(APP_DIR, './modules/system/views/home-launch.ejs')).pipe(gulp.dest(BUILD_DIR + '/modules/system/views')),
        gulp.src(resolve(APP_DIR, './dist/launch/*')).pipe(gulp.dest(BUILD_DIR + '/dist/launch')),
        gulp.src(resolve(APP_DIR, './serverless-aws-java/**/*')).pipe(gulp.dest(BUILD_DIR + '/serverless-aws-java'))
    ]);
});

gulp.task('usemin', ['copyDist'], function useminTask() {
    let streamArray: any[] = [];
    [
        {folder: './modules/system/views/', filename: 'index.ejs'},
        {folder: './modules/_embedApp/', filename: 'embedApp.ejs'},
        {folder: './modules/_fhirApp/', filename: 'fhirApp.ejs'},
        {folder: './modules/_nativeRenderApp/', filename: 'nativeRenderApp.ejs'},
    ].forEach(item => {
        let useminOutputs: string[] = [];

        function outputFile(file: any) {
            useminOutputs.push(file.path.match(/(\\|\/)(app|embed|fhir|native)(\\|\/).*$/)[0].replace(/\\/g, '/'));
            return file;
        }

        function getCssLink(/*file*/) {
            return '"' + useminOutputs.filter(f => f.endsWith('.css'))[0] + '"';
        }

        function getJsLink(/*file*/) {
            return '"' + useminOutputs.filter(f => f.endsWith('.js'))[0] + '"';
        }

        let useminTask = gulp.src(resolve(APP_DIR, item.folder + item.filename))
            .pipe(usemin({
                jsAttributes: {async: true},
                assetsDir: resolve(APP_DIR, './dist/'),
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
            .pipe(gulp.dest(BUILD_DIR + '/dist/'));
        streamArray.push(useminTask);
        useminTask.on('end', function () {
            if (item.filename === 'index.ejs') {
                if (useminOutputs.length !== 2) {
                    console.log('useminOutputs:' + useminOutputs);
                    throw new Error('service worker creation failed');
                }
                gulp.src(BUILD_DIR + '/dist/app/sw.js') // does not preserve order
                    .pipe(replace('"/app/cde.css"', '"' + useminOutputs[0] + '"'))
                    .pipe(replace('"/app/cde.js"', '"' + useminOutputs[1] + '"'))
                    .pipe(replace('cde-cache-', 'cde-cache-v'))
                    .pipe(gulp.dest(BUILD_DIR + '/dist/app/'));
            }
        });
    });
    return merge(streamArray);
});

gulp.task('copyUsemin', ['usemin'], function usemin() {
    let streamArray: any[] = [];
    [
        {folder: './modules/system/views/bot/', filename: '*.ejs'},
        {folder: './modules/system/views/', filename: 'index.ejs'},
        {folder: './modules/_embedApp/', filename: 'embedApp.ejs'},
        {folder: './modules/_nativeRenderApp/', filename: 'nativeRenderApp.ejs'},
        {folder: './modules/_fhirApp/', filename: 'fhirApp.ejs'}
    ].forEach(item => {
        streamArray.push(gulp.src(BUILD_DIR + '/dist/' + item.filename)
            .pipe(gulp.dest(BUILD_DIR + '/' + item.folder)));
    });
    return merge(streamArray);
});

gulp.task('es', function es() {
    const elasticsearch = require('elasticsearch');

    let esClient = new elasticsearch.Client({
        hosts: config.elastic.hosts
    });
    return Promise.all(
        Object.values(config.elastic).map((i: any) => i && i.name).filter(i => !!i)
            .map(indexName => {
                console.log('Deleting es index: ' + indexName);
                return new Promise((resolve, reject) => {
                    esClient.indices.delete({index: indexName, timeout: '6s'}, (err?: any) => {
                        err && err.status !== 404 ? reject(err) : resolve();
                    });
                });
            })
    );
});

// Procedure calling task in README
gulp.task('buildHome', function buildHome() {
    return gulp.src(resolve(APP_DIR, './modules/system/views/home.ejs'))
        .pipe(replace('<NIHCDECONTENT/>', readFileSync('./modules/_app/staticHome/nihcde.html', {encoding: 'utf8'})))
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
        .pipe(gulp.dest(resolve(APP_DIR, './dist/')))
        .pipe(rename('home-launch.ejs'))
        .pipe(gulp.dest(resolve(APP_DIR, './modules/system/views')));
});

gulp.task('checkDbConnection', function checkDbConnection() {
    return new Promise(function (resolve, reject) {
        let isRequireDbConnection = !!require.cache[require.resolve('./server/system/connections')];
        if (isRequireDbConnection) reject('DB connection cannot be included in gulp.');
        else resolve();
    });
});

gulp.task('npmrebuild', function npmrebuild() {
    return run('npm rebuild', runOptions).exec();
});

gulp.task('mongorestoretest', function mongorestore() {
    let username = config.database.appData.username;
    let password = config.database.appData.password;
    let hostname = config.database.servers[0].host + ':' + config.database.servers[0].port;
    let db = config.database.appData.db;
    let args = ['-u', username, '-p', password, '-h', hostname, '-d', db, '--drop', 'test/data/test/'];

    console.log('command: ' + 'mongorestore ' + args.join(' '));
    return run('mongorestore ' + args.join(' '), runOptions).exec();
});

gulp.task('injectElastic', ['es', 'mongorestoretest'], function injectElastic() {
    return run('node scripts/indexDb').exec();
});

gulp.task('checkBundleSize', ['buildDist'], function checkBundleSize() {
    return run('node scripts/buildCheckSize', runOptions).exec();
});

gulp.task('refreshDbs', ['es', 'mongorestoretest', 'injectElastic']);

gulp.task('prepareApp', ['copyNpmDeps', 'prepareVersion', 'copyUsemin', 'checkDbConnection', 'checkBundleSize']);

gulp.task('default', ['refreshDbs', 'prepareApp']);
