import {exec, ExecOptions} from 'child_process';
import {Client} from '@elastic/elasticsearch';
import {Client as ClientNewType} from '@elastic/elasticsearch/api/new';
import * as gulp from 'gulp';
import * as replace from 'gulp-replace';
import * as merge from 'merge-stream';
import {resolve} from 'path';
import {ElasticIndex, indices} from 'server/system/elasticSearchInit';
import {config} from 'server/config'; // gulpfile: cannot use 'server' because it connects to db

require('es6-promise').polyfill();

const APP_DIR = __dirname;
const BUILD_DIR = appDir(config.node.buildDir);
const runInAppOptions = {cwd: APP_DIR};
const runInBuildOptions = {cwd: BUILD_DIR};
const nodeCmd = isRunningAsTs() ? 'npx ts-node -P tsconfigNode.json ' : 'node ';
const fullBuild = process.argv.includes('--full');

const hostname = process.env.host_name;
console.log(`buildDir: ${BUILD_DIR}`);
console.log(`appDir: ${APP_DIR}`);
if (hostname) {
    console.log(`hostname IN GULP****************************: ${hostname.toString()}`);
} else {
    console.log(`no hostname found.`);
}

function appDir(path: string = '.') {
    return resolve(APP_DIR, path);
}

function buildDir(path: string = '.') {
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

gulp.task('environmentInfo', async function npm() {
    await run('node --version', runInAppOptions);
    await run('npm -v', runInAppOptions);
    await run('npm cache verify', runInAppOptions);
    await run('mongorestore --version', runInAppOptions);
    await run("echo NODE_ENV:$NODE_ENV");
});

gulp.task('buildNode', function buildNode() {
    if (fullBuild) {
        return run('npm run buildIngester', runInAppOptions);
    }
    if (isRunningAsTs()) {
        return run('npm run buildNode', runInAppOptions);
    }
});

gulp.task('copyCodeToBuildDir', ['buildNode'], function copyCode() {
    const assetFolders: string[] = [
        'modules/form/public/assets',
        'modules/processManager',
        'modules/swagger/public',
        'server/swagger/api',
        'shared/de/assets',
        'shared/form/assets',
        'shared/mapping/fhir/assets'
    ]
    const streamArray: NodeJS.ReadWriteStream[] = [];
    assetFolders.forEach(folder => {
        streamArray.push(gulp.src(appDir(folder + '/**'))
            .pipe(gulp.dest(buildDir(folder + '/'))));
    });

    streamArray.push(gulp.src(appDir('./config/*.json'))
        .pipe(gulp.dest(buildDir('./config/'))));

    // build dir may not be a sub-folder, need packages
    streamArray.push(gulp.src(appDir('./package.json'))
        .pipe(replace('"startJs": "node ./buildNode/server/app.js",', '"startJs": "node ./server/app.js",'))
        .pipe(replace('"testServer": "node ./test/testLoginServer.js",', ''))
        .pipe(fullBuild
            ? replace('noop', 'noop')
            : replace('"ingester": "file:./ingester",', '')
        )
        .pipe(gulp.dest(buildDir())));
    streamArray.push(gulp.src(appDir('./packages/**'))
        .pipe(gulp.dest(buildDir('./packages/'))));

    // from buildNode
    streamArray.push(gulp.src('./modules/**')
        .pipe(gulp.dest(buildDir('./modules/'))));
    streamArray.push(gulp.src(appDir('./server/bot/*.ejs'))
        .pipe(gulp.dest(buildDir('./server/bot/'))));
    streamArray.push(gulp.src('./server/**')
        .pipe(gulp.dest(buildDir('./server/')))
        .on('end', () => {
            streamArray.push(gulp.src('./server/globals.js')
                .pipe(replace("APP_DIR = __dirname + '/../..'", "APP_DIR = __dirname + '/..'"))
                .pipe(gulp.dest(buildDir('server/'))));
        }));
    streamArray.push(gulp.src('./shared/**')
        .pipe(gulp.dest(buildDir('shared/'))));

    if (fullBuild) {
        streamArray.push(gulp.src(appDir('./ingester/**/*.js'))
            .pipe(gulp.dest(buildDir('./ingester/'))));
        streamArray.push(gulp.src(appDir('./ingester/**'))
            .pipe(gulp.dest(buildDir('./ingester/'))));
        streamArray.push(gulp.src(appDir('./scripts/**'))
            .pipe(gulp.dest(buildDir('./scripts/'))));
    }

    return merge(streamArray);
});

gulp.task('copyNpmDeps', ['copyCodeToBuildDir'], function copyNpmDeps() {
    return new Promise((resolve, reject) => {
        gulp.src(buildDir('./package.json'))
            .pipe(gulp.dest(buildDir()))
            .on('error', reject)
            .on('end', () => {
                run('npm i --omit=dev --ignore-scripts', Object.assign({env: {NODE_OPTIONS: '--max-old-space-size=8192'}}, runInBuildOptions)).then(resolve, reject);
            });
    });
});

gulp.task('es', function es() {
    const esClient: ClientNewType = new Client({
        nodes: config.elastic.hosts.map((s: string) => (
            {
                url: new URL(s),
                ssl: {rejectUnauthorized: false}
            }
        ))
    }) as any;
    esClient.info().then(info => console.log(info));
    return Promise.all(
        indices.map((index: ElasticIndex) => new Promise<void>((resolve, reject) => {
            console.log('Deleting es index: ' + index.indexName);
            esClient.indices.delete({index: index.indexName, timeout: '6s'}, (err: any | null) => {
                err && err.meta && err.meta.statusCode === 404 ? resolve() : reject(err);
            });
        }))
    );
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

gulp.task('mongorestoretestlog', function mongorestore() {
    const username = config.database.log.username;
    const password = config.database.log.password;
    const hostname = config.database.servers[0].host + ':' + config.database.servers[0].port;
    const db = config.database.log.db;
    const args = ['-h', hostname, '-d', db, '--drop', 'test/data/cde-logs-test/'];
    // if (process.env.CI) {
    //     args.push('--ssl', '--tlsInsecure')
    // }
    if (username) {
        args.push('-u', username, '-p', password)
    }

    return run('mongorestore ' + args.join(' '), runInAppOptions);
});

gulp.task('mongorestoretest', function mongorestore() {
    const username = config.database.appData.username;
    const password = config.database.appData.password;
    const hostname = config.database.servers[0].host + ':' + config.database.servers[0].port;
    const db = config.database.appData.db;
    const args = ['-h', hostname, '-d', db, '--drop', 'test/data/test/'];
    // if (process.env.CI) {
    //     args.push('--ssl', '--tlsInsecure')
    // }
    if (username) {
        args.push('-u', username, '-p', password);
    }

    return run('mongorestore ' + args.join(' '), runInAppOptions);
});

gulp.task('prepareApp', ['copyNpmDeps', 'checkDbConnection']);

gulp.task('injectElastic', ['prepareApp', 'es', 'mongorestoretest', 'mongorestoretestlog'], function injectElastic() {
    return node('scripts/indexDb');
});

gulp.task('refreshDbs', ['es', 'mongorestoretest', 'injectElastic']);

gulp.task('default', ['environmentInfo', 'refreshDbs', 'prepareApp']);
