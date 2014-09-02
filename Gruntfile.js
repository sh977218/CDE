require('./deploy/configTest.js');

var config = require('config')
    , elastic = require('./deploy/elasticSearchInit.js')
    , chalk = require('chalk')
    , fs = require('fs');
    
var welcomeMessage = fs.readFileSync("./deploy/doc/welcome.txt");
var helpMessage = fs.readFileSync("./deploy/doc/help.txt");

module.exports = function(grunt) {
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
                }
            }
            , elasticCreateFormRiver: {
                options: {
                    uri: config.elasticFormRiverUri + "/_meta"
                    , method: 'POST'
                    , json: elastic.createFormRiverJson                   
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
                    callback: function(err, stdout, stderr, cb){
                        grunt.config('version',stdout);
                        cb();
                        return;
                    }
                }               
            } 
            , ingestTest: {
                command: function () {
                            return [
                                "mongo " + config.database.servers[0].host + ":" + config.database.servers[0].port + "/" + config.database.dbname + " deploy/dbInit.js"
                                , "mongo " + config.database.servers[0].host + ":" + config.database.servers[0].port + "/" + config.database.dbname + " deploy/logInit.js"
                                , "groovy -cp ./groovy/ groovy/UploadCadsr test/data/cadsrTestSeed.xml " + config.database.servers[0].host + " " + config.database.dbname + " test"
                                , "groovy -cp ./groovy/ groovy/uploadNindsXls test/data/ninds-test.xlsx " + config.database.servers[0].host + " " + config.database.dbname + " --testMode"
                                , "groovy -cp ./groovy/ groovy/Grdr test/data/grdr.xlsx " + config.database.servers[0].host + " " + config.database.dbname
                                , "mongo " + config.database.servers[0].host + ":" + config.database.servers[0].port + "/" + config.database.dbname + " test/createLargeBoard.js"
                            ].join("&&")
                }
            }
            , ingestProd: {
                command: function () {
                            return [
                                "mongo " + config.database.servers[0].host + ":" + config.database.servers[0].port + "/" + config.database.dbname + " deploy/dbInit.js"
                                , "mongo cde-logs-test deploy/logInit.js"
                                , "find ../nlm-seed/ExternalCDEs/caDSR/*.xml -exec groovy -cp ./groovy/ groovy/UploadCadsr {} " + config.database.servers[0].host + " " + config.database.dbname + " \;"
                                //, "groovy -cp ./groovy/ groovy/uploadNindsXls \"../nlm-seed/ExternalCDEs/ninds/Data Element Import_20140523.xlsx\" " + config.database.servers[0].host + " " + config.database.dbname 
                                //, "groovy -cp ./groovy/ groovy/Grdr test/data/grdr.xlsx " + config.database.servers[0].host + " " + config.database.dbname
                            ].join("&&")
                }
            }  
            , runTests: {
                command: function() { return "gradle -b test/selenium/build.gradle -PtestUrl=" + grunt.config('testUrl') + " -Pbrowser=" + config.test.browser + " -Ptimeout=" + config.test.timeout + " -PforkNb=" + config.test.forkNb + " clean test " + config.test.testsToRun + " &";}
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
                            , 'deploy/configTest.js'
                            , 'node_modules/**'
                            , 'app.js'
                        ]
                        , dest: config.node.buildDir
                    }
                ]
            }
        }        
        , prompt: {
            git: {
                options: {
                    questions: [
                        {
                            config: 'git.pull'
                            , type: 'confirm'
                            , message: 'Do you want to ' + 'pull'.green  + ' the latest source-code from the ' + 'master'.green + ' branch?'
                        }                        
                    ]
                }
            }              
            , elastic: {
                options: {
                    questions: [
                        {
                            config: 'elastic.index.delete'
                            , type: 'confirm'
                            , message: 'Do you want to ' + 'delete'.red  + ' Elastic Search ' + 'index for ' + config.name + ' configuration?'
                        }
                        , {
                            config: 'elastic.index.create'
                            , type: 'confirm'
                            , message: 'Do you want to ' + 'create'.green  + ' Elastic Search ' + 'index for ' + config.name + ' configuration?'
                        }
                        , {
                            config: 'elastic.river.delete'
                            , type: 'confirm'
                            , message: 'Do you want to ' + 'delete'.red  + ' Elastic Search ' + 'river for ' + config.name + ' configuration?'
                        } 
                        , {
                            config: 'elastic.river.create'
                            , type: 'confirm'
                            , message: 'Do you want to ' + 'create'.green  + ' Elastic Search ' + 'river for ' + config.name + ' configuration?'
                        }                           
                    ]
                }
            }  
            , node: {
                options: {
                    questions: [
                        {
                            config: 'node.scripts.stop'
                            , type: 'confirm'
                            , message: 'Do you want to ' + 'stop'.red  + ' NodeJS?' + ' Command: (see config.js): \'' + config.node.scripts.stop + '\''
                        }
                        , {
                            config: 'node.scripts.start'
                            , type: 'confirm'
                            , message: 'Do you want to ' + 'start'.green  + ' NodeJS?'  + ' Command (see config.js): \'' + config.node.scripts.start + '\''
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
                            , message: 'Do you want to '+ 'empty database'.red + ' and re-ingest data?'
                            , default: false
                            , choices: [{
                                value: false
                                , name: 'Keep Existing Data.'.green
                            }
                            , {
                                value: "test"
                                , name: 'Delete'.red + ' \'' + config.name + '\' & Reingest ' + 'small'.yellow + ' collection!'
                            }
                            , {
                                value: "production"
                                , name: 'Delete'.red + ' \'' + config.name + '\' & Reingest ' + 'large'.yellow + ' collection!'
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
                                , name: 'Localhost '+'localhost:3001'.green
                            }
                            , {
                                value: "http://cde-dev.nlm.nih.gov:3001"
                                , name: 'Dev '+'cde-dev.nlm.nih.gov:3001'.red
                            }
                            , {
                                value: "https://cde-qa.nlm.nih.gov:3001"
                                , name: 'QA '+'cde-qa.nlm.nih.gov:3001'.red
                            }]
                        }
                    ]                    
                }
            }
            
        }
        , useref: {
            html: [ config.node.buildDir + '/modules/system/views/index.ejs', config.node.buildDir + '/modules/system/views/includeFrontEndJS.ejs', config.node.buildDir + '/modules/form/views/includeFrontEndJS.ejs', config.node.buildDir + '/modules/cde/views/includeFrontEndJS.ejs']
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
        }
//        , watch: {
//            files: [
//                'modules/cde/public/assets/js/**/*.js',
//                'modules/system/public/js/controllers/**/*.js',
//                'modules/cde/public/js/**/*.js',
//                'modules/form/public/js/**/*.js',
//                'modules/system/public/js/**/*.js',
//                'modules/cde/shared/**/*.js',
//                'modules/cde/public/css/**/*.css'
//            ],
//            tasks: ['build'],
//            options: {
//                spawn: true
//            }
//        }
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
    
    grunt.registerTask('do-git', 'Restart NodeJS server.', function() {
        if (grunt.config('git.pull')) {
            grunt.task.run('gitpull');
            grunt.task.run('buildVersion');
        }     
    });     
    
    grunt.registerTask('do-elastic', function() {
        if (grunt.config('elastic.river.delete')) {
            grunt.log.writeln('\n\nDeleting Elastic Search River!');
            grunt.task.run('http:elasticDeleteRiver');
        }        
        if (grunt.config('elastic.index.delete')) {
            grunt.log.writeln('\n\nDeleting Elastic Search Index!');
            grunt.task.run('http:elasticDeleteIndex');
        }
        if (grunt.config('elastic.index.create')) {
            grunt.log.writeln('\n\nCreating Elastic Search Index!');
            grunt.task.run('http:elasticCreateIndex');
        }
        if (grunt.config('elastic.river.create')) {
            grunt.log.writeln('\n\nCreating Elastic Search River!');
            grunt.task.run('http:elasticCreateRiver');
        }        
    });       
    
    grunt.registerTask('do-node', function() {
        if (grunt.config('node.scripts.stop')) {
            grunt.task.run('shell:stop');
        }
        if (grunt.config('node.scripts.start')) {
            grunt.task.run('shell:start');
        }      
    });  
    
    grunt.registerTask('do-ingest', function() {
        if (grunt.config('ingest')==="test") {
            grunt.task.run('shell:ingestTest');
        }
        if (grunt.config('ingest')==="production") {
            grunt.task.run('shell:ingestProd');
        }   
        grunt.task.run('clearQueue');
    });  
        
    grunt.registerTask('divider', function() {
        console.log('\n------------------------------------------------------------');
    });     
    
    grunt.registerTask('do-help', function() {
        if (grunt.config('showHelp')=="help") {
            grunt.task.run('attention:help');
        }   
        if (grunt.config('showHelp')=="ingest") {
            grunt.task.run('ingest');
        }  
        if (grunt.config('showHelp')=="tests") {
            grunt.task.run('tests');
        }         
    }); 
    
    grunt.registerTask('do-test', function() {
        if (grunt.config('testUrl')==="localhost:3001") {
            grunt.task.run('shell:ingestTest');
            grunt.util.spawn({
                cmd: 'node'
                , args: ['node-js/app.js']
            });
        }
        grunt.task.run('shell:runTests');
    });
    
    grunt.registerTask('clearQueue', function() {
        grunt.task.clearQueue();
    });     
    
    grunt.registerTask('persistVersion', function() {
        fs.writeFileSync("./modules/system/views/version.ejs", grunt.config.get("version"));         
    });    

    grunt.registerTask('git', 'Pull and merge the latest source-code from the Master branch.', ['prompt:git', 'do-git']);
    grunt.registerTask('elastic', 'Delete and re-create ElasticSearch index and its river.', ['prompt:elastic', 'do-elastic']);
    grunt.registerTask('node', 'Restart NodeJS server.', ['prompt:node', 'do-node']);
    grunt.registerTask('buildVersion',['shell:version','persistVersion']);
    grunt.registerTask('ingest',['prompt:ingest','do-ingest']);
    grunt.registerTask('tests',['prompt:testsLocation','do-test','clearQueue']);
    grunt.registerTask('refreplace-concat-minify', 'Run reference replacement, concatenation, minification build directory', ['useref', 'concat', 'uglify', 'cssmin']);
    grunt.registerTask('build', 'Download dependencies and copy application to its build directory.', function() {
        grunt.task.run('npm-install');
        if (config.node.buildDir) {
            grunt.task.run('copy');
            grunt.task.run('refreplace-concat-minify');
        }
    });
    grunt.registerTask('guihelp', ['prompt:help', 'do-help']);
    grunt.registerTask('default', 'The entire deployment process.', ['attention:welcome','divider','guihelp','divider','git','divider','elastic','divider','build','divider','node']);
    grunt.registerTask('help', ['availabletasks']);    
    grunt.registerTask('form-elastic', ['http:elasticDeleteFormRiver', 'http:elasticDeleteFormIndex', 'http:elasticCreateFormIndex', 'http:elasticCreateFormRiver']);

//    grunt.registerTask('form-elastic', function() {
//        //grunt.task.run('force:on');
//        grunt.log.writeln('\n\nDeleting Elastic Search River!');
//        grunt.task.run('http:elasticDeleteFormRiver');
//        grunt.log.writeln('\n\nDeleting Elastic Search Index!');
//        grunt.task.run('http:elasticDeleteFormIndex');
//        grunt.log.writeln('\n\nCreating Elastic Search Index!');
//        grunt.task.run('http:elasticCreateFormIndex');
//        grunt.log.writeln('\n\nCreating Elastic Search River!');
//        grunt.task.run('http:elasticCreateFormRiver');      
//    });     

};