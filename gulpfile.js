const data = require('gulp-data');
const fs = require('fs');
const git = require('gulp-git');
const gulp = require('gulp');
const task = gulp.task;
const series = gulp.series;
const parallel = gulp.parallel;
const src = gulp.src;
const dest = gulp.dest;

const exec = require('child_process').exec;
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

require('es6-promise').polyfill();

task('npm', function _npm() {
    run('node --version').exec();
    run('npm cache verify').exec();
    return src(['./package.json'])
        .pipe(install());
});

task('npmRebuildNodeSass', series('npm', function _npmRebuildNodeSass() {
    return run('npm rebuild node-sass').exec();
}));

task('thirdParty', series('npmRebuildNodeSass', function _thirdParty() {
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
}));

task('createDist', series('thirdParty', function _createDist() {
    const sass = require('gulp-sass');
    sass.compiler = require('node-sass'); // delay using node-sass until npmRebuildNodeSass is done
    return src('./modules/common.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(dest('./dist/common'));
}));

task('copyCode', function _copyCode() {
    let streamArray = [];

    streamArray.push(src('./modules/_fhirApp/fhirAppLaunch.html')
        .pipe(dest(config.node.buildDir + '/modules/_fhirApp/')));

    ['cde', 'form', 'processManager', 'system', 'board'].forEach(module => {
        streamArray.push(src('./modules/' + module + '/**/*.png')
            .pipe(dest(config.node.buildDir + '/modules/' + module + '/')));
        streamArray.push(src('./modules/' + module + '/**/*.ico')
            .pipe(dest(config.node.buildDir + '/modules/' + module + '/')));
        streamArray.push(src('./modules/' + module + '/**/*.gif')
            .pipe(dest(config.node.buildDir + '/modules/' + module + '/')));
        streamArray.push(src('./modules/' + module + '/views/**/*.html')
            .pipe(dest(config.node.buildDir + '/modules/' + module + '/views/')));
        streamArray.push(src('./modules/' + module + '/views/bot/*.ejs')
            .pipe(dest(config.node.buildDir + '/modules/' + module + '/views/bot/')));
    });

    ['supportedBrowsers.ejs', 'loginText.ejs'].forEach(function (file) {
        streamArray.push(src('./modules/system/views/' + file)
            .pipe(dest(config.node.buildDir + '/modules/system/views/')));
    });
    streamArray.push(src('./modules/processManager/pmApp.js')
        .pipe(dest(config.node.buildDir + '/modules/processManager/')));

    streamArray.push(src('./modules/swagger/index.js')
        .pipe(dest(config.node.buildDir + '/modules/swagger/')));
    streamArray.push(src('./modules/swagger/api/swagger.yaml')
        .pipe(dest(config.node.buildDir + '/modules/swagger/api/')));
    streamArray.push(src('./modules/swagger/public/swagger.css')
        .pipe(dest(config.node.buildDir + '/modules/swagger/public')));

    streamArray.push(src('./modules/system/public/robots.txt')
        .pipe(dest(config.node.buildDir + '/modules/system/public/')));


    streamArray.push(src('./config/*.json')
        .pipe(dest(config.node.buildDir + '/config/')));

    streamArray.push(src('./app.js')
        .pipe(dest(config.node.buildDir + '/')));
    streamArray.push(src('./package.json')
        .pipe(dest(config.node.buildDir + '/')));

    streamArray.push(src('./deploy/*')
        .pipe(dest(config.node.buildDir + '/deploy/')));

    streamArray.push(src('./ingester/**')
        .pipe(dest(config.node.buildDir + '/ingester/')));

    streamArray.push(src('./modules/form/public/html/lformsRender.html')
        .pipe(dest(config.node.buildDir + '/modules/form/public/html/')));

    streamArray.push(src('./modules/form/public/assets/**')
        .pipe(dest(config.node.buildDir + '/modules/form/public/assets/')));

    streamArray.push(src('./server/**')
        .pipe(dest(config.node.buildDir + '/server/')));

    streamArray.push(src('./shared/**')
        .pipe(dest(config.node.buildDir + '/shared/')));

    return merge(streamArray);
});

task('copyNpmDeps', series('copyCode', 'npmRebuildNodeSass', function _copyNpmDeps() {
    run('npm -v').exec();
    return src('./package.json')
        .pipe(dest(config.node.buildDir))
        .pipe(install({npm: '--production'}));
}));

task('prepareVersion', series('copyCode', function _prepareVersion() {
    return git.revParse({args: '--short HEAD'}, function (err, hash) {
        fs.writeFile(config.node.buildDir + '/server/system/version.js', 'exports.version = "' + hash + '";',
            function (err) {
                if (err) console.log('ERROR generating version.html: ' + err);
                else console.log('generated ' + config.node.buildDir + '/server/system/version.js');
            });
    });
}));

task('copyDist', series('createDist',
    build = () => run('npm run build').exec(),
    copyApp = () => src(['./dist/app/**/*', '!./dist/app/cde.css', '!./dist/app/cde.js']).pipe(dest(config.node.buildDir + '/dist/app')),
    copyEmbed = () => src(['./dist/embed/**/*', '!./dist/embed/embed.css', '!./dist/embed/embed.js']).pipe(dest(config.node.buildDir + '/dist/embed')),
    copyFhir = () => src(['./dist/fhir/*', '!./dist/fhir/fhir.css', '!./dist/fhir/fhir.js']).pipe(dest(config.node.buildDir + '/dist/fhir')),
    copyNative = () => src(['./dist/native/**/*', '!./dist/native/native.css', '!./dist/native/native.js']).pipe(dest(config.node.buildDir + '/dist/native')),
    copyHome = () => src('./modules/system/views/home-launch.ejs').pipe(dest(config.node.buildDir + '/modules/system/views')),
    copyLaunch = () => src('./dist/launch/*').pipe(dest(config.node.buildDir + '/dist/launch')),
    copyServerless = () => src('./serverless-aws-java/**/*').pipe(dest(config.node.buildDir + '/serverless-aws-java'))
));

task('usemin', series('copyDist', function _usemin() {
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
            .pipe(dest(config.node.buildDir + '/dist/'));
        streamArray.push(useminTask);
        useminTask.on('end', function () {
            if (item.filename === 'index.ejs') {
                if (useminOutputs.length !== 2) {
                    console.log('useminOutputs:' + useminOutputs);
                    throw new Error('service worker creation failed');
                }
                src(config.node.buildDir + '/dist/app/sw.js') // does not preserve order
                    .pipe(replace('"/app/cde.css"', '"' + useminOutputs[0] + '"'))
                    .pipe(replace('"/app/cde.js"', '"' + useminOutputs[1] + '"'))
                    .pipe(replace('cde-cache-', 'cde-cache-v'))
                    .pipe(dest(config.node.buildDir + '/dist/app/'));
            }
        });
    });
    return merge(streamArray);
}));

task('copyUsemin', series('usemin', function _usemin() {
    let streamArray = [];
    [
        {folder: './modules/system/views/bot/', filename: '*.ejs'},
        {folder: './modules/system/views/', filename: 'index.ejs'},
        {folder: './modules/_embedApp/', filename: 'embedApp.ejs'},
        {folder: './modules/_nativeRenderApp/', filename: 'nativeRenderApp.ejs'},
        {folder: './modules/_fhirApp/', filename: 'fhirApp.ejs'}
    ].forEach(item => {
        streamArray.push(src(config.node.buildDir + '/dist/' + item.filename)
            .pipe(dest(config.node.buildDir + '/' + item.folder)));
    });
    return merge(streamArray);
}));

// Procedure calling task in README
task('buildHome', function _buildHome() {
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
});

task('es', function _es(cb) {
    const elasticsearch = require('elasticsearch');
    let esClient = new elasticsearch.Client({
        hosts: config.elastic.hosts
    });
    let allIndex = esInit.indices.map(i => i.indexName).join(',');
    console.log('All index: ' + allIndex);

    esClient.indices.delete({index: allIndex, timeout: '6s'}, function (err) {
        if (err && err.status !== 404) throw err;
        else cb();
    });
});
task('mongoRestore', function _mongoRestore(cb) {
    exec('bash restore-test-instance.sh', cb);
});

task('injectElastic', function _injectElastic(cb) {
    exec('node scripts/reindexElasticSearch.js', cb);

});
task('waitForElastic', function _waitForElastic(cb) {
    exec('node scripts/waitForIndex.js', cb);
});
task('checkBundleSize', function _checkBundleSize(cb) {
    exec('node scripts/buildCheckSize.js', cb);
});

task('step1', series('mongoRestore', 'injectElastic'));
task('step2', series('copyNpmDeps', 'prepareVersion', 'copyUsemin', 'checkBundleSize'));
task('default', parallel('step1', 'step2'));


