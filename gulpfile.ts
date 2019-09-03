import { exec, ExecOptions } from 'child_process';
import * as elasticsearch from 'elasticsearch';
import { readFileSync, writeFile } from 'fs';
import * as gulp from 'gulp';
import * as minifyCss from 'gulp-clean-css';
import * as data from 'gulp-data';
import { revParse } from 'gulp-git';
import * as htmlmin from 'gulp-htmlmin';
import * as rename from 'gulp-rename';
import * as replace from 'gulp-replace';
import * as rev from 'gulp-rev';
import * as uglify from 'gulp-uglify';
import * as usemin from 'gulp-usemin';
import * as merge from 'merge-stream';
import { resolve } from 'path';
import * as File from 'vinyl';
import { ElasticIndex, indices } from 'server/system/elasticSearchInit';
import { config } from 'server/system/parseConfig';

require('es6-promise').polyfill();

interface StatusCodeError extends Error {
    status: number;
}

const APP_DIR = __dirname;
const BUILD_DIR = appDir(config.node.buildDir);
const runOptions = {cwd: APP_DIR};

function appDir(path) {
    return resolve(APP_DIR, path);
}

function buildDir(path) {
    return resolve(BUILD_DIR, path);
}

function run(command, options?: ExecOptions): Promise<void> {
    return new Promise(((resolve, reject) => {
        exec(command, options, (err, stdout, stderr) => {
            stdout && console.log(stdout);
            stderr && console.error(stderr);
            err ? reject(err) : resolve();
        });
    }));
}

gulp.task('npm', function npm() {
    run('node --version', runOptions);
    run('npm -v', runOptions);
    run('npm cache verify', runOptions);
    run('mongo --version', runOptions);
    return run('npm i', runOptions);
});

gulp.task('npmRebuildNodeSass', ['npm'], function npmRebuildNodeSass() {
    return run('npm rebuild node-sass', runOptions);
});

gulp.task('copyThirdParty', ['npmRebuildNodeSass'], function copyThirdParty() {
    const streamArr: NodeJS.ReadWriteStream[] = [];

    streamArr.push(gulp.src(appDir('./node_modules/core-js/client/core.min.js'))
        .pipe(replace('//# sourceMappingURL=core.min.js.map', ''))
        .pipe(gulp.dest(appDir('./dist/common/'))));
    streamArr.push(gulp.src(appDir('./node_modules/intl/dist/Intl.min.js'))
        .pipe(replace('//# sourceMappingURL=Intl.min.js.map', ''))
        .pipe(gulp.dest(appDir('./dist/common/'))));
    streamArr.push(gulp.src(appDir('./node_modules/web-animations-js/web-animations.min.js'))
        .pipe(replace('//# sourceMappingURL=web-animations.min.js.map', ''))
        .pipe(gulp.dest(appDir('./dist/common/'))));
    streamArr.push(gulp.src([
        appDir('./node_modules/classlist.js/classList.min.js'),
        appDir('./node_modules/intl/locale-data/jsonp/en.js'),
        appDir('./node_modules/whatwg-fetch/dist/fetch.umd.js')
    ]).pipe(gulp.dest(appDir('./dist/common/'))));

    return merge(streamArr);
});

gulp.task('createDist', ['copyThirdParty'], function createDist() {
    const sass = require('gulp-sass');
    sass.compiler = require('node-sass'); // delay using node-sass until npmRebuildNodeSass is done
    return gulp.src(appDir('./modules/common.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(appDir('./dist/common')));
});

gulp.task('copyCode', function copyCode() {
    const streamArray: NodeJS.ReadWriteStream[] = [];

    streamArray.push(gulp.src(appDir('./modules/_fhirApp/fhirAppLaunch.html'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/_fhirApp/')));

    ['cde', 'form', 'processManager', 'system', 'board'].forEach(module => {
        streamArray.push(gulp.src(appDir('./modules/' + module + '/**/*.png'))
            .pipe(gulp.dest(BUILD_DIR + '/modules/' + module + '/')));
        streamArray.push(gulp.src(appDir('./modules/' + module + '/**/*.ico'))
            .pipe(gulp.dest(BUILD_DIR + '/modules/' + module + '/')));
        streamArray.push(gulp.src(appDir('./modules/' + module + '/**/*.gif'))
            .pipe(gulp.dest(BUILD_DIR + '/modules/' + module + '/')));
        streamArray.push(gulp.src(appDir('./modules/' + module + '/views/**/*.html'))
            .pipe(gulp.dest(BUILD_DIR + '/modules/' + module + '/views/')));
        streamArray.push(gulp.src(appDir('./modules/' + module + '/views/bot/*.ejs'))
            .pipe(gulp.dest(BUILD_DIR + '/modules/' + module + '/views/bot/')));
    });

    ['supportedBrowsers.ejs', 'loginText.ejs'].forEach(function (file) {
        streamArray.push(gulp.src(appDir('./modules/system/views/' + file))
            .pipe(gulp.dest(BUILD_DIR + '/modules/system/views/')));
    });
    streamArray.push(gulp.src(appDir('./modules/processManager/pmApp.js'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/processManager/')));

    streamArray.push(gulp.src('./modules/swagger/index.js')
        .pipe(gulp.dest(BUILD_DIR + '/modules/swagger/')));
    streamArray.push(gulp.src(appDir('./modules/swagger/api/swagger.yaml'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/swagger/api/')));
    streamArray.push(gulp.src(appDir('./modules/swagger/public/swagger.css'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/swagger/public')));

    streamArray.push(gulp.src(appDir('./modules/system/public/robots.txt'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/system/public/')));


    streamArray.push(gulp.src(appDir('./config/*.json'))
        .pipe(gulp.dest(BUILD_DIR + '/config/')));

    streamArray.push(gulp.src(appDir('./package.json'))
        .pipe(replace('"startJs": "node ./buildNode/app.js",', '"startJs": "node app.js",'))
        .pipe(gulp.dest(BUILD_DIR + '/')));

    streamArray.push(gulp.src(appDir('./deploy/*'))
        .pipe(gulp.dest(BUILD_DIR + '/deploy/')));

    streamArray.push(gulp.src(appDir('./ingester/**'))
        .pipe(gulp.dest(BUILD_DIR + '/ingester/')));

    streamArray.push(gulp.src(appDir('./modules/form/public/html/lformsRender.html'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/form/public/html/')));

    streamArray.push(gulp.src(appDir('./modules/form/public/assets/**'))
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

gulp.task('copyNpmDeps', ['copyCode', 'npmRebuildNodeSass'], function copyNpmDeps(cb) {
    gulp.src(buildDir('./package.json'))
        .pipe(gulp.dest(BUILD_DIR))
        .on('error', cb)
        .on('end', () => {
            run('npm i --production', {cwd: BUILD_DIR}).then(cb, cb);
        });
});

gulp.task('prepareVersion', ['copyCode'], function prepareVersion() {
    return revParse({args: '--short HEAD'}, function (err: NodeJS.ErrnoException, hash: string) {
        writeFile(BUILD_DIR + '/server/system/version.js', 'exports.version = "' + hash + '";',
            function (err: NodeJS.ErrnoException) {
                if (err) console.log('ERROR generating version.html: ' + err);
                else console.log('generated ' + BUILD_DIR + '/server/system/version.js');
            });
    });
});

gulp.task('buildDist', ['createDist'], function copyDist() {
    return Promise.all([
        run('npm run buildAppJs', runOptions),
        run('npm run buildNativeJs', runOptions),
        run('npm run buildEmbedJs', runOptions),
        run('npm run buildFhirJs', runOptions),
        run('npm run buildFnAwsJava', runOptions)
    ]);
});

gulp.task('copyDist', ['buildDist'], function copyDist() {
    return merge([
        gulp.src([appDir('./dist/app/**/*'), '!' + appDir('./dist/app/cde.css'), '!' + appDir('./dist/app/cde.js')]).pipe(gulp.dest(BUILD_DIR + '/dist/app')),
        gulp.src([appDir('./dist/embed/**/*'), '!' + appDir('./dist/embed/embed.css'), '!' + appDir('./dist/embed/embed.js')]).pipe(gulp.dest(BUILD_DIR + '/dist/embed')),
        gulp.src([appDir('./dist/fhir/*'), '!' + appDir('./dist/fhir/fhir.css'), '!' + appDir('./dist/fhir/fhir.js')]).pipe(gulp.dest(BUILD_DIR + '/dist/fhir')),
        gulp.src([appDir('./dist/native/**/*'), '!' + appDir('./dist/native/native.css'), '!' + appDir('./dist/native/native.js')]).pipe(gulp.dest(BUILD_DIR + '/dist/native')),
        gulp.src(appDir('./modules/system/views/home-launch.ejs')).pipe(gulp.dest(BUILD_DIR + '/modules/system/views')),
        gulp.src(appDir('./dist/launch/*')).pipe(gulp.dest(BUILD_DIR + '/dist/launch')),
        gulp.src(appDir('./serverless-aws-java/**/*')).pipe(gulp.dest(BUILD_DIR + '/serverless-aws-java'))
    ]);
});

gulp.task('usemin', ['copyDist'], function useminTask() {
    let streamArray: NodeJS.ReadWriteStream[] = [];
    [
        {folder: './modules/system/views/', filename: 'index.ejs'},
        {folder: './modules/_embedApp/', filename: 'embedApp.ejs'},
        {folder: './modules/_fhirApp/', filename: 'fhirApp.ejs'},
        {folder: './modules/_nativeRenderApp/', filename: 'nativeRenderApp.ejs'},
    ].forEach(item => {
        let useminOutputs: string[] = [];

        function outputFile(file: File) {
            useminOutputs.push(file.path.match(/(\\|\/)(app|embed|fhir|native)(\\|\/).*$/)![0].replace(/\\/g, '/'));
            return file;
        }

        function getCssLink(/*file*/) {
            return '"' + useminOutputs.filter(f => f.endsWith('.css'))[0] + '"';
        }

        function getJsLink(/*file*/) {
            return '"' + useminOutputs.filter(f => f.endsWith('.js'))[0] + '"';
        }

        let useminTask = gulp.src(appDir(item.folder + item.filename))
            .pipe(usemin({
                jsAttributes: {async: true},
                assetsDir: appDir('./dist/'),
                css: [minifyCss(), 'concat', rev(), data(outputFile)],
                html: [htmlmin({
                    collapseInlineTagWhitespace: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    minifyJS: true,
                    minifyCSS: true,
                    preserveLineBreaks: true,
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
    let streamArray: NodeJS.ReadWriteStream[] = [];
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
    let esClient = new elasticsearch.Client({
        hosts: config.elastic.hosts
    });
    return Promise.all(
        indices.map((index: ElasticIndex) => new Promise((resolve, reject) => {
            console.log('Deleting es index: ' + index.indexName);
            esClient.indices.delete({index: index.indexName, timeout: '6s'}, (err?: StatusCodeError) => {
                err && err.status !== 404 ? reject(err) : resolve();
            });
        }))
    );
});

// Procedure calling task in README
gulp.task('buildHome', function buildHome() {
    return gulp.src(appDir('./modules/system/views/home.ejs'))
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
        .pipe(gulp.dest(appDir('./dist/')))
        .pipe(rename('home-launch.ejs'))
        .pipe(gulp.dest(appDir('./modules/system/views')));
});

gulp.task('checkDbConnection', function checkDbConnection() {
    return new Promise(function (resolve, reject) {
        let isRequireDbConnection = !!require.cache[require.resolve('./server/system/connections')];
        if (isRequireDbConnection) reject('DB connection cannot be included in gulp.');
        else resolve();
    });
});

gulp.task('npmrebuild', function npmrebuild() {
    return run('npm rebuild', runOptions);
});

gulp.task('mongorestoretest', function mongorestore() {
    let username = config.database.appData.username;
    let password = config.database.appData.password;
    let hostname = config.database.servers[0].host + ':' + config.database.servers[0].port;
    let db = config.database.appData.db;
    let args = ['-u', username, '-p', password, '-h', hostname, '-d', db, '--drop', 'test/data/test/'];

    return run('mongorestore ' + args.join(' '), runOptions);
});

gulp.task('injectElastic', ['es', 'mongorestoretest'], function injectElastic() {
    return run('node scripts/indexDb');
});

gulp.task('checkBundleSize', ['buildDist'], function checkBundleSize() {
    return run('node scripts/buildCheckSize');
});

gulp.task('refreshDbs', ['es', 'mongorestoretest', 'injectElastic']);

gulp.task('prepareApp', ['copyNpmDeps', 'prepareVersion', 'copyUsemin', 'checkDbConnection', 'checkBundleSize']);

gulp.task('default', ['refreshDbs', 'prepareApp']);
