import { exec, ExecOptions } from 'child_process';
import { Client } from '@elastic/elasticsearch';
import { readFileSync } from 'fs';
import * as gulp from 'gulp';
import * as minifyCss from 'gulp-clean-css';
import * as data from 'gulp-data';
import * as htmlmin from 'gulp-htmlmin';
import * as rename from 'gulp-rename';
import * as replace from 'gulp-replace';
import * as rev from 'gulp-rev';
import * as uglify from 'gulp-uglify';
import * as usemin from 'gulp-usemin';
import * as merge from 'merge-stream';
import { resolve } from 'path';
import { config } from 'server/config'; // gulpfile: cannot use 'server' because it connects to db
import { ElasticIndex, indices } from 'server/system/elasticSearchInit';
import * as File from 'vinyl';

require('es6-promise').polyfill();

const APP_DIR = __dirname;
const BUILD_DIR = appDir(config.node.buildDir);
const runInAppOptions = {cwd: APP_DIR};
const nodeCmd = isRunningAsTs() ? 'npx ts-node -P tsconfigNode.json ' : 'node ';
const fullBuild = process.argv.includes('--full');

function appDir(path: string) {
    return resolve(APP_DIR, path);
}

function buildDir(path: string) {
    return resolve(BUILD_DIR, path);
}

function isRunningAsTs() {
    return APP_DIR === __dirname;
}

function run(command: string, options?: ExecOptions): Promise<void> {
    return new Promise(((resolve, reject) => {
        exec(command, options, (err, stdout, stderr) => {
            if (stdout) {
                console.log(stdout);
            }
            if (stderr) {
                console.error(stderr);
            }
            err ? reject(err) : resolve();
        });
    }));
}

function node(file: string, options?: ExecOptions): Promise<void> {
    return run(nodeCmd + file, options);
}

gulp.task('npm', function npm() {
    run('node --version', runInAppOptions);
    run('npm -v', runInAppOptions);
    run('npm cache verify', runInAppOptions);
    run('mongo --version', runInAppOptions);
    run('mongorestore --version', runInAppOptions);
    return run('npm i', runInAppOptions);
});

gulp.task('npmRebuild', ['npm'], function npmRebuild() {
    return run('npm rebuild node-sass', runInAppOptions);
});

gulp.task('copyThirdParty', ['npmRebuild'], function copyThirdParty() {
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
    // const sass = require('gulp-sass');
    // sass.compiler = require('node-sass'); // delay using node-sass until npmRebuild NodeSass is done
    // return gulp.src(appDir('./modules/common.scss'))
    //     .pipe(sass().on('error', sass.logError))
    //     .pipe(gulp.dest(appDir('./dist/common')));
});

gulp.task('buildNode', ['npmRebuild'], function buildNode() {
    if (fullBuild) {
        return run('npm run buildIngester', runInAppOptions);
    }
    if (isRunningAsTs()) {
        return run('npm run buildNode', runInAppOptions);
    }
});

gulp.task('copyCode', ['buildNode'], function copyCode() {
    const assetFolders: string[] = [
        'modules/cde/public/assets/img/min',
        'modules/form/public/assets',
        'modules/form/public/html',
        'modules/processManager',
        'modules/swagger/public',
        'server/swagger/api',
        'shared/de/assets',
        'shared/form/assets',
        'shared/mapping/fhir/assets'
    ]
    const streamArray: NodeJS.ReadWriteStream[] = [];
    assetFolders.forEach(folder => {
        streamArray.push(gulp.src(appDir('./' + folder + '/**'))
             .pipe(gulp.dest(BUILD_DIR + '/' + folder + '/')));
    });

    streamArray.push(gulp.src(appDir('./modules/system/views/**/*.html'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/system/views/')));
    ['supportedBrowsers.ejs', 'loginText.ejs'].forEach((file) => {
        streamArray.push(gulp.src(appDir('./modules/system/views/' + file))
            .pipe(gulp.dest(BUILD_DIR + '/modules/system/views/')));
    });

    streamArray.push(gulp.src(appDir('./modules/system/public/robots.txt'))
        .pipe(gulp.dest(BUILD_DIR + '/modules/system/public/')));


    streamArray.push(gulp.src(appDir('./config/*.json'))
        .pipe(gulp.dest(BUILD_DIR + '/config/')));

    streamArray.push(gulp.src(appDir('./package.json'))
        .pipe(replace('"startJs": "node ./buildNode/server/app.js",', '"startJs": "node ./server/app.js",'))
        .pipe(replace('"postinstall": "npm run moveCssAngularTree && npx ngcc"', '"postinstall": ""'))
        .pipe(replace('"testServer": "node ./test/testLoginServer.js",', ''))
        .pipe(fullBuild
            ? replace('noop', 'noop')
            : replace('"ingester": "file:./ingester",', '')
        )
        .pipe(gulp.dest(BUILD_DIR + '/')));

    streamArray.push(gulp.src(appDir('./deploy/*'))
        .pipe(gulp.dest(BUILD_DIR + '/deploy/')));

    // from buildNode
    streamArray.push(gulp.src('./modules/**')
        .pipe(gulp.dest(BUILD_DIR + '/modules/')));
    streamArray.push(gulp.src(appDir('./server/bot/*.ejs'))
        .pipe(gulp.dest(BUILD_DIR + '/server/bot/')));
    streamArray.push(gulp.src('./server/**')
        .pipe(gulp.dest(BUILD_DIR + '/server/'))
        .on('end', () => {
            streamArray.push(gulp.src('./server/globals.js')
                .pipe(replace("APP_DIR = __dirname + '/../..'", "APP_DIR = __dirname + '/..'"))
                .pipe(gulp.dest(BUILD_DIR + '/server/')));
        }));
    streamArray.push(gulp.src('./shared/**')
        .pipe(gulp.dest(BUILD_DIR + '/shared/')));

    if (fullBuild) {
        streamArray.push(gulp.src(appDir('./ingester/**/*.js'))
            .pipe(gulp.dest(BUILD_DIR + '/ingester/')));
        streamArray.push(gulp.src('./ingester/**')
            .pipe(gulp.dest(BUILD_DIR + '/ingester/')));
        streamArray.push(gulp.src('./scripts/**')
            .pipe(gulp.dest(BUILD_DIR + '/scripts/')));
    }

    return merge(streamArray);
});

gulp.task('copyNpmDeps', ['copyCode', 'npmRebuild'], function copyNpmDeps(cb) {
    gulp.src(buildDir('./package.json'))
        .pipe(gulp.dest(BUILD_DIR))
        .on('error', cb)
        .on('end', () => {
            run('npm i --production', {cwd: BUILD_DIR}).then(cb, cb);
        });
});

gulp.task('buildDist', ['createDist'], function copyDist() {
    const runAll = [
        run('npm run buildApp', runInAppOptions),
        run('npm run buildNative', runInAppOptions),
    ];

    if (config.provider.faas === 'AWS') {
        runAll.push(run('npm run buildFnAwsJava', runInAppOptions));
    }

    return Promise.all(runAll);
});

gulp.task('copyDist', ['buildDist'], function copyDist() {
    return merge([
        gulp.src([appDir('./dist/app/**/*'), '!' + appDir('./dist/app/cde.css'), '!' + appDir('./dist/app/cde.js')])
            .pipe(gulp.dest(BUILD_DIR + '/dist/app')),
        gulp.src([appDir('./dist/embed/**/*'), '!' + appDir('./dist/embed/embed.css'), '!' + appDir('./dist/embed/embed.js')])
            .pipe(gulp.dest(BUILD_DIR + '/dist/embed')),
        gulp.src([appDir('./dist/native/**/*'), '!' + appDir('./dist/native/native.css'), '!' + appDir('./dist/native/native.js')])
            .pipe(gulp.dest(BUILD_DIR + '/dist/native')),
        gulp.src(appDir('./modules/system/views/home-launch.ejs')).pipe(gulp.dest(BUILD_DIR + '/modules/system/views')),
        gulp.src(appDir('./dist/launch/*')).pipe(gulp.dest(BUILD_DIR + '/dist/launch')),
        gulp.src(appDir('./serverless-aws-java/**/*')).pipe(gulp.dest(BUILD_DIR + '/serverless-aws-java'))
    ]);
});

gulp.task('usemin', ['copyDist'], function useminTask() {
    const streamArray: NodeJS.ReadWriteStream[] = [];
    [
        {folder: './modules/system/views/', filename: 'index.ejs'},
        {folder: './frontEnd/_nativeRenderApp/', filename: 'nativeRenderApp.ejs'},
    ].forEach(item => {
        const useminOutputs: string[] = [];

        function outputFile(file: File) {
            const matches = file.path.match(/(\\|\/)(app|embed|native)(\\|\/).*$/);
            if (!matches || !matches.length) {
                throw new Error('bad file path for being processed: ' + file.path);
            }
            useminOutputs.push(matches[0].replace(/\\/g, '/'));
            return file;
        }

        function getCssLink(/*file*/) {
            return '"' + useminOutputs.filter(f => f.endsWith('.css'))[0] + '"';
        }

        function getJsLink(/*file*/) {
            return '"' + useminOutputs.filter(f => f.endsWith('.js'))[0] + '"';
        }

        const useminTask = gulp.src(appDir(item.folder + item.filename))
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
            .pipe(replace('"/native/native.css"', getCssLink))
            .pipe(replace('"/native/native.js"', getJsLink))
            .pipe(gulp.dest(BUILD_DIR + '/dist/'));
        streamArray.push(useminTask);
        useminTask.on('end', () => {
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
    const streamArray: NodeJS.ReadWriteStream[] = [];
    [
        {folder: './modules/system/views/bot/', filename: '*.ejs'},
        {folder: './modules/system/views/', filename: 'index.ejs'},
        {folder: './frontEnd/_nativeRenderApp/', filename: 'nativeRenderApp.ejs'}
    ].forEach(item => {
        streamArray.push(gulp.src(BUILD_DIR + '/dist/' + item.filename)
            .pipe(gulp.dest(BUILD_DIR + '/' + item.folder)));
    });
    return merge(streamArray);
});

gulp.task('es', function es() {
    const esClient = new Client({
        nodes: config.elastic.hosts.map((s: string) => (
            {
                url: new URL(s),
                ssl: {rejectUnauthorized: false}
            }
        ))
    });
    return Promise.all(
        indices.map((index: ElasticIndex) => new Promise<void>((resolve, reject) => {
            console.log('Deleting es index: ' + index.indexName);
            esClient.indices.delete({index: index.indexName, timeout: '6s'}, (err: any | null) => {
                err && err.meta && err.meta.statusCode === 404 ? resolve() : reject(err);
            });
        }))
    );
});

// Procedure calling task in README
gulp.task('buildHome', function buildHome() {
    return gulp.src(appDir('./modules/system/views/home.ejs'))
        .pipe(replace('<NIHCDECONTENT/>', readFileSync(appDir('./modules/_app/staticHome/nihcde.html'), {encoding: 'utf8'})))
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
            assetsDir: appDir('./dist/'),
            inlinecss: [minifyCss, 'concat'],
            inlinejs: [uglify({mangle: false}), 'concat'],
        }))
        .pipe(gulp.dest(appDir('./dist/')))
        .pipe(rename('home-launch.ejs'))
        .pipe(gulp.dest(appDir('./modules/system/views')));
});

gulp.task('checkDbConnection', function checkDbConnection() {
    return new Promise<void>((resolve, reject) => {
        const isRequireDbConnection = !!require.cache[require.resolve('./server/system/connections')];
        if (isRequireDbConnection) {
            reject('DB connection cannot be included in gulp.');
        } else {
            resolve();
        }
    });
});

gulp.task('npmrebuild', function npmrebuild() {
    return run('npm rebuild', runInAppOptions);
});

gulp.task('mongorestoretest', function mongorestore() {
    const username = config.database.appData.username;
    const password = config.database.appData.password;
    const hostname = config.database.servers[0].host + ':' + config.database.servers[0].port;
    const db = config.database.appData.db;
    const args = ['-u', username, '-p', password, '-h', hostname, '-d', db, '--drop', 'test/data/test/'];

    return run('mongorestore ' + args.join(' '), runInAppOptions);
});

gulp.task('injectElastic', ['es', 'mongorestoretest', 'npmRebuild'], function injectElastic() {
    return node('scripts/indexDb');
});

gulp.task('checkBundleSize', ['buildDist'], function checkBundleSize() {
    return node('buildNode/scripts/buildCheckSize', runInAppOptions);
});

gulp.task('refreshDbs', ['es', 'mongorestoretest', 'injectElastic']);

gulp.task('prepareApp', ['copyNpmDeps', 'copyUsemin', 'checkDbConnection', 'checkBundleSize']);

gulp.task('default', ['refreshDbs', 'prepareApp']);
