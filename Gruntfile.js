require('./deploy/configTest.js');

var config = require('./modules/system/node-js/parseConfig')
    , elastic = require('./deploy/elasticSearchInit.js')
    , chalk = require('chalk')
    , fs = require('fs')
    , tar = require('tar')
    , zlib = require('zlib')
    , spawn = require('child_process').spawn
    , fstream = require('fstream')
    ;

var welcomeMessage = fs.readFileSync("./deploy/doc/welcome.txt");
var helpMessage = fs.readFileSync("./deploy/doc/help.txt");

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
        , gitpull: {
            origin: {
                options: {
                    branch: 'master'
                }
            }
        }
        , http: {
            elasticDeleteIndex: {
                options: {
                    uri: config.elasticUri
                    , method: 'DELETE'
                    , ignoreErrors: true
                }
            }
            , elasticCreateIndex: {
                options: {
                    uri: config.elasticUri
                    , method: 'POST'
                    , json: elastic.createIndexJson
                }
            }
            , elasticDeleteRiver: {
                options: {
                    uri: config.elasticRiverUri
                    , method: 'DELETE'
                    , ignoreErrors: true
                }
            }
            , elasticCreateRiver: {
                options: {
                    uri: config.elasticRiverUri + "/_meta"
                    , method: 'POST'
                    , json: elastic.createRiverJson
                }
            }
            , elasticDeleteFormIndex: {
                options: {
                    uri: config.elasticFormUri
                    , method: 'DELETE'
                    , ignoreErrors: true
                }
            }
            , elasticCreateFormIndex: {
                options: {
                    uri: config.elasticFormUri
                    , method: 'POST'
                    , json: elastic.createFormIndexJson
                }
            }
            , elasticDeleteFormRiver: {
                options: {
                    uri: config.elasticFormRiverUri
                    , method: 'DELETE'
                    , ignoreErrors: true
                }
            }
            , elasticCreateFormRiver: {
                options: {
                    uri: config.elasticFormRiverUri + "/_meta"
                    , method: 'POST'
                    , json: elastic.createFormRiverJson
                }
            }
            , elasticDeleteBoardIndex: {
                options: {
                    uri: config.elasticBoardIndexUri
                    , method: 'DELETE'
                    , ignoreErrors: true
                }
            }
            , elasticCreateBoardIndex: {
                options: {
                    uri: config.elasticBoardIndexUri
                    , method: 'POST'
                    , json: elastic.createBoardIndexJson
                }
            }
            , elasticDeleteBoardRiver: {
                options: {
                    uri: config.elasticBoardRiverUri
                    , method: 'DELETE'
                    , ignoreErrors: true
                }
            }
            , elasticCreateBoardRiver: {
                options: {
                    uri: config.elasticBoardRiverUri + "/_meta"
                    , method: 'POST'
                    , json: elastic.createBoardRiverJson
                }
            }
            , elasticDeleteStoredQueryIndex: {
                options: {
                    uri: config.elasticStoredQueryUri
                    , method: 'DELETE'
                    , ignoreErrors: true
                }
            }
            , elasticCreateStoredQueryIndex: {
                options: {
                    uri: config.elasticStoredQueryUri
                    , method: 'POST'
                    , json: elastic.createStoredQueryIndexJson
                }
            }
        }
        , shell: {
            stop: {
                command: config.node.scripts.stop
            }
            , start: {
                command: config.node.scripts.start
            }
            , version: {
                command: 'git rev-parse HEAD'
                , options: {
                    callback: function (err, stdout, stderr, cb) {
                        grunt.config('version', stdout);
                        cb();
                    }
                }
            }
            , ingestTest: {
                command: function () {
                    return [
                        "mongo " + config.database.servers[0].host + ":" + config.database.servers[0].port + "/" + config.database.appData.db + " deploy/dbInit.js"
                        , "mongo " + config.database.servers[0].host + ":" + config.database.servers[0].port + "/" + config.database.log.db + " deploy/logInit.js"
                        , "groovy -cp ./groovy/ groovy/UploadCadsr test/data/cadsrTestSeed.xml " + config.database.servers[0].host + " " + config.database.appData.db + " test"
                        , "groovy -cp ./groovy/ groovy/uploadNindsXls test/data/ninds-test.xlsx " + config.database.servers[0].host + " " + config.database.appData.db + " --testMode"
                        , "groovy -cp ./groovy/ groovy/Grdr test/data/grdr.xlsx " + config.database.servers[0].host + " " + config.database.appData.db
                        , "mongo " + config.database.servers[0].host + ":" + config.database.servers[0].port + "/" + config.database.appData.db + " test/createLargeBoard.js"
                    ].join("&&")
                }
            }
            , ingestProd: {
                command: function () {
                    return [
                        "mongo " + config.database.servers[0].host + ":" + config.database.servers[0].port + "/" + config.database.appData.db + " deploy/dbInit.js"
                        , "mongo cde-logs-test deploy/logInit.js"
                        , "find ../nlm-seed/ExternalCDEs/caDSR/*.xml -exec groovy -cp ./groovy/ groovy/UploadCadsr {} " + config.database.servers[0].host + " " + config.database.appData.db + " \;"
                        //, "groovy -cp ./groovy/ groovy/uploadNindsXls \"../nlm-seed/ExternalCDEs/ninds/Data Element Import_20140523.xlsx\" " + config.database.servers[0].host + " " + config.database.dbname
                        //, "groovy -cp ./groovy/ groovy/Grdr test/data/grdr.xlsx " + config.database.servers[0].host + " " + config.database.dbname
                    ].join("&&")
                }
            }
            , runTests: {
                command: function () {
                    return "gradle -b test/selenium/build.gradle -PtestUrl=" + grunt.config('testUrl') + " -Pbrowser=" + config.test.browser + " -Ptimeout=" + config.test.timeout + " -PforkNb=" + config.test.forkNb + " clean test " + config.test.testsToRun + " &";
                }
            }
        }
        , copy: {
            main: {
                files: [
                    {
                        expand: true
                        , cwd: '.'
                        , src: [
                        'modules/**'
                        , 'config/**'
                        , 'deploy/**'
                        , 'Gruntfile.js'
                        , 'node_modules/**'
                        , "deploy/kibana.js"
                        , 'app.js'
                        , 'package.json'
                    ]
                        , dest: config.node.buildDir
                    }
                ]
            }
        }
        , prompt: {
            node: {
                options: {
                    questions: [
                        {
                            config: 'node.scripts.stop'
                            ,
                            type: 'confirm'
                            ,
                            message: 'Do you want to ' + 'stop'.red + ' NodeJS?' + ' Command: (see config.js): \'' + config.node.scripts.stop + '\''
                        }
                        , {
                            config: 'node.scripts.start'
                            ,
                            type: 'confirm'
                            ,
                            message: 'Do you want to ' + 'start'.green + ' NodeJS?' + ' Command (see config.js): \'' + config.node.scripts.start + '\''
                        }
                    ]
                }
            }
            , help: {
                options: {
                    questions: [
                        {
                            config: 'showHelp'
                            , type: 'list'
                            , message: 'Please select ...'
                            , default: "run"
                            , choices: [{
                            value: "run"
                            , name: 'Run Deployment'
                        }
                            , {
                                value: "help"
                                , name: 'Show Help Screen'
                            }, {
                                value: "tests"
                                , name: 'Run Tests'
                            }, {
                                value: "ingest"
                                , name: 'Erase Database & Reingest Data'
                            }]
                        }
                    ]
                }
            }
            , ingest: {
                options: {
                    questions: [
                        {
                            config: 'ingest'
                            , type: 'list'
                            , message: 'Do you want to ' + 'empty database'.red + ' and re-ingest data?'
                            , default: false
                            , choices: [{
                            value: false
                            , name: 'Keep Existing Data.'.green
                        }
                            , {
                                value: "test"
                                ,
                                name: 'Delete'.red + ' \'' + config.name + '\' & Reingest ' + 'small'.yellow + ' collection!'
                            }
                            , {
                                value: "production"
                                ,
                                name: 'Delete'.red + ' \'' + config.name + '\' & Reingest ' + 'large'.yellow + ' collection!'
                            }]
                        }
                    ]
                }
            }
            , testsLocation: {
                options: {
                    questions: [
                        {
                            config: 'testUrl'
                            , type: 'list'
                            , message: 'What is the test ' + 'destination'.green + '?'
                            , default: "localhost:3001"
                            , choices: [{
                            value: "localhost:3001"
                            , name: 'Localhost ' + 'localhost:3001'.green
                        }
                            , {
                                value: "http://cde-dev.nlm.nih.gov:3001"
                                , name: 'Dev ' + 'cde-dev.nlm.nih.gov:3001'.red
                            }
                            , {
                                value: "https://cde-qa.nlm.nih.gov:3001"
                                , name: 'QA ' + 'cde-qa.nlm.nih.gov:3001'.red
                            }]
                        }
                    ]
                }
            }

        }
        , useref: {
            html: [
                config.node.buildDir + '/modules/system/views/index.ejs',
                config.node.buildDir + '/modules/system/views/includeFrontEndJS.ejs',
                config.node.buildDir + '/modules/form/views/includeFrontEndJS.ejs',
                config.node.buildDir + '/modules/cde/views/includeFrontEndJS.ejs']
            , temp: config.node.buildDir + '/modules'
        }
        , uglify: {
            options: {
                compress: true
                , mangle: false
            }
        }
        , availabletasks: {
            help: {
                options: {
                    filter: 'include',
                    tasks: ['git', 'elastic', 'build', 'node']
                }
            }
        }
        , attention: {
            welcome: {
                options: {
                    message: chalk.yellow(welcomeMessage)
                    , border: 'double'
                    , borderColor: 'bgGreen'
                }
            }
            , help: {
                options: {
                    message: chalk.yellow(helpMessage)
                    , border: 'double'
                    , borderColor: 'bgGreen'
                }
            }
        },
        // https://www.npmjs.org/package/grunt-bower-install-simple
        // Grunt Task for Installing Bower Dependencies
        "bower-install-simple": {
            options: {
                // Whether output is colorized
                color: true,
                // Path where bower installed components should be saved
                directory: "bower_components"
            },
            "dev": {
                options: {
                	// Whether output is colorized
                    color: true,
                    // Path where bower installed components should be saved
                    directory: "modules/components"
                }
            }
        },
        wiredep: {
            task: {
                src: [
                    "modules/system/views/index.ejs"
                ], options: {
                    directory: "modules/components"
                    , ignorePath: "../.."
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-git');
    grunt.loadNpmTasks('grunt-http');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-npm-install');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-available-tasks');
    grunt.loadNpmTasks('grunt-attention');
    grunt.loadNpmTasks('grunt-useref');
    grunt.loadNpmTasks("grunt-bower-install-simple");
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.registerTask('do-git', 'Restart NodeJS server.', function() {
        if (grunt.config('git.pull')) {
            grunt.task.run('gitpull');
            grunt.task.run('buildVersion');
        }
    });

    grunt.registerTask('do-elastic', function () {
        grunt.log.writeln('\n\nRe-creating ElasticSearch Indexes!');
        grunt.task.run('http:elasticDeleteRiver');
        grunt.task.run('http:elasticDeleteIndex');
        grunt.task.run('http:elasticCreateIndex');
        grunt.task.run('http:elasticCreateRiver');

        grunt.task.run('http:elasticDeleteFormRiver');
        grunt.task.run('http:elasticDeleteFormIndex');
        grunt.task.run('http:elasticCreateFormIndex');
        grunt.task.run('http:elasticCreateFormRiver');

        grunt.task.run('http:elasticDeleteBoardRiver');
        grunt.task.run('http:elasticDeleteBoardIndex');
        grunt.task.run('http:elasticCreateBoardIndex');
        grunt.task.run('http:elasticCreateBoardRiver');

        grunt.task.run('http:elasticDeleteStoredQueryIndex');
        grunt.task.run('http:elasticCreateStoredQueryIndex');
    });

    grunt.registerTask('do-node', function () {
        if (grunt.config('node.scripts.stop')) {
            grunt.task.run('shell:stop');
        }
        if (grunt.config('node.scripts.start')) {
            grunt.task.run('shell:start');
        }
    });

    grunt.registerTask('do-ingest', function () {
        if (grunt.config('ingest') === "test") {
            grunt.task.run('shell:ingestTest');
        }
        if (grunt.config('ingest') === "production") {
            grunt.task.run('shell:ingestProd');
        }
        grunt.task.run('clearQueue');
    });

    grunt.registerTask('divider', function () {
        console.log('\n------------------------------------------------------------');
    });

    grunt.registerTask('do-help', function () {
        if (grunt.config('showHelp') == "help") {
            grunt.task.run('attention:help');
        }
        if (grunt.config('showHelp') == "ingest") {
            grunt.task.run('ingest');
        }
        if (grunt.config('showHelp') == "tests") {
            grunt.task.run('tests');
        }
    });

    grunt.registerTask('do-test', function () {
        if (grunt.config('testUrl') === "localhost:3001") {
            grunt.task.run('shell:ingestTest');
            grunt.util.spawn({
                cmd: 'node'
                , args: ['node-js/app.js']
            });
        }
        grunt.task.run('shell:runTests');
    });

    grunt.registerTask('clearQueue', function () {
        grunt.task.clearQueue();
    });

    grunt.registerTask('persistVersion', function () {
        fs.writeFileSync("./modules/system/public/html/version.html", grunt.config.get("version"));
    });
    grunt.registerTask('tarCode', function () {
        var done = this.async();
        var writeS = fs.createWriteStream('./code.tar.gz');
        writeS.on('close', function () {
            // tar done, now sign with gpg
            var gpg = spawn('gpg', ["-s", "./code.tar.gz"]);
            gpg.on('close', function (code) {
                fs.unlinkSync("./code.tar.gz");
                done();
            });
        });
        var fixupDirs = function (entry) {
            // Make sure readable directories have execute permission
            if (entry.props.type === "Directory")
                entry.props.mode |= (entry.props.mode >>> 2) & 0111;
            return true;
        };

        return fstream.Reader({path: config.node.buildDir, type: 'Directory', filter: fixupDirs}).pipe(
            tar.Pack()).pipe(zlib.createGzip()).pipe(writeS);
    });


    grunt.registerTask('git', 'Pull and merge the latest source-code from the Master branch.', ['prompt:git', 'do-git']);
    grunt.registerTask('elastic', 'Delete and re-create ElasticSearch index and its river.', ['do-elastic']);
    grunt.registerTask('node', 'Restart NodeJS server.', ['prompt:node', 'do-node']);
    grunt.registerTask('buildVersion',['shell:version','persistVersion']);
    grunt.registerTask('ingest',['prompt:ingest','do-ingest']);
    grunt.registerTask('tests',['prompt:testsLocation','do-test','clearQueue']);
    grunt.registerTask('bower',['bower-install-simple', 'wiredep']);
    grunt.registerTask('ci', ['buildVersion', 'bower', 'wiredep', 'elastic']);
    grunt.registerTask('refreplace-concat-minify', 'Run reference replacement, concatenation, minification build directory', ['useref', 'concat', 'cssmin']);
    grunt.registerTask('build', 'Download dependencies and copy application to its build directory.', function () {
        grunt.task.run('npm-install');
        if (config.node.buildDir) {
            grunt.task.run('copy');
            grunt.task.run('buildVersion');
            grunt.task.run('refreplace-concat-minify');
        }
    });
    grunt.registerTask('guihelp', ['prompt:help', 'do-help']);
    grunt.registerTask('default', 'The entire deployment process.', ['attention:welcome','buildVersion','divider','guihelp','divider','elastic','divider','bower-install-simple', 'wiredep', 'divider','divider','build']);
    grunt.registerTask('help', ['availabletasks']);
    grunt.registerTask('form-elastic', ['http:elasticDeleteFormRiver', 'http:elasticDeleteFormIndex', 'http:elasticCreateFormIndex', 'http:elasticCreateFormRiver']);
};