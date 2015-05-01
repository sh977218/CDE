require('./deploy/configTest.js');

var config = require('config')
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
                        
                        , {
                            config: 'elastic.form.index.delete'
                            , type: 'confirm'
                            , message: 'Do you want to ' + 'delete'.red  + ' Elastic Search ' + 'form index for ' + config.name + ' configuration?'
                        }
                        , {
                            config: 'elastic.form.index.create'
                            , type: 'confirm'
                            , message: 'Do you want to ' + 'create'.green  + ' Elastic Search ' + 'form index for ' + config.name + ' configuration?'
                        }
                        , {
                            config: 'elastic.form.river.delete'
                            , type: 'confirm'
                            , message: 'Do you want to ' + 'delete'.red  + ' Elastic Search ' + 'form river for ' + config.name + ' configuration?'
                        } 
                        , {
                            config: 'elastic.form.river.create'
                            , type: 'confirm'
                            , message: 'Do you want to ' + 'create'.green  + ' Elastic Search ' + 'form river for ' + config.name + ' configuration?'
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
                    	// Do not install project devDependencies. The equivalent of bower install --production.
                        production: false
                    }
                }
        },
        // https://www.npmjs.org/package/grunt-bowercopy
        // Wrangle bower dependencies and place each one where it's supposed to be.
        bowercopy: {
            options: {
                //  source locations with the correct bower folder location
                srcPrefix: 'bower_components'
            },
            js: {
                options: {
                    // prefix for destinations
                    destPrefix: 'modules/cde/public/assets'
                },
                files: {
                    // Keys are destinations (prefixed with `options.destPrefix`)
                    // Values are sources (prefixed with `options.srcPrefix`); One source per destination
                    // e.g. 'bower_components/jquery/dist/jquery.min.js' will be copied to 'public/js/jquery.min.js'
                    'js/jquery.min.js': 'jquery/jquery.min.js',
                    'js/jquery-ui.min.js': 'jquery-ui/jquery-ui.min.js',
                    'js/angular.min.js': 'angular/angular.min.js',
                    'js/angular-route.min.js': 'angular-route/angular-route.min.js',
                    'js/angular-resource.min.js': 'angular-resource/angular-resource.min.js',
                    'js/angular-sanitize.min.js': 'angular-sanitize/angular-sanitize.min.js',
                    'js/angular-animate.min.js': 'angular-animate/angular-animate.min.js',
                    'js/angular-file-upload.min.js': 'ng-file-upload/angular-file-upload.min.js',
                    'js/timeAgo.js': 'angular-timeago/src/timeAgo.js',
                    'js/textAngular.min.js': 'textAngular/dist/textAngular.min.js',
                    'js/textAngular-rangy.min.js': 'textAngular/dist/textAngular-rangy.min.js',
                    'js/textAngular-sanitize.min.js': 'textAngular/dist/textAngular-sanitize.min.js',
                    'js/bootstrap-tour.js': 'bootstrap-tour/build/js/bootstrap-tour.js',
                    'js/bootstrap.js': 'bootstrap/dist/js/bootstrap.js',
                    'js/camelCaseToHuman.js': 'angularjs-camelCase-human/camelCaseToHuman.js',
                    'js/ui-bootstrap-tpls.js': 'angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
                    'js/ng-grid.js': 'ng-grid/build/ng-grid.js'
                }
            },
            map: {
                options: {
                    // prefix for destinations
                    destPrefix: 'modules/cde/public/assets'
                },
                files: {
                    // Keys are destinations (prefixed with `options.destPrefix`)
                    // Values are sources (prefixed with `options.srcPrefix`); One source per destination
                    // e.g. 'bower_components/jquery/dist/jquery.min.js' will be copied to 'public/js/jquery.min.js'
                    'js/jquery.min.map': 'jquery/jquery.min.map',
                    'js/angular.min.js.map': 'angular/angular.min.js.map',
                    'js/angular-route.min.js.map': 'angular-route/angular-route.min.js.map',
                    'js/angular-resource.min.js.map': 'angular-resource/angular-resource.min.js.map',
                    'js/angular-sanitize.min.js.map': 'angular-sanitize/angular-sanitize.min.js.map',
                    'js/angular-animate.min.js.map': 'angular-animate/angular-animate.min.js.map'
                }
            },
            css: {
                options: {
                    destPrefix: 'modules/cde/public/assets'
                },
                files: {
                    'css/bootstrap.min.css': 'bootstrap/dist/css/bootstrap.min.css',
                    'css/font-awesome.min.css': 'font-awesome/css/font-awesome.min.css',
                    'css/select2.css': 'select2/select2.css',
                    'css/select2.png': 'select2/select2.png',
                    'css/selectize.default.css': 'selectize/dist/css/selectize.default.css',
                    'css/textAngular.css': 'textAngular/src/textAngular.css',
                    'css/bootstrap-tour.min.css': 'bootstrap-tour/build/css/bootstrap-tour.min.css'
                }
            },
            bootstrapFont: {
                files: {
                    'modules/cde/public/assets/fonts': 'bootstrap/dist/fonts/*'
                }
            },
            fontAwesomeFont: {
                files: {
                    'modules/cde/public/assets/fonts': 'font-awesome/fonts/*'
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
    grunt.loadNpmTasks("grunt-bower-install-simple");
    grunt.loadNpmTasks('grunt-bowercopy');
    
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
        
        if (grunt.config('elastic.form.river.delete')) {
            grunt.log.writeln('\n\nDeleting Elastic Search Form River!');
            grunt.task.run('http:elasticDeleteFormRiver');
        }        
        if (grunt.config('elastic.form.index.delete')) {
            grunt.log.writeln('\n\nDeleting Elastic Search Form Index!');
            grunt.task.run('http:elasticDeleteFormIndex');
        }
        if (grunt.config('elastic.form.index.create')) {
            grunt.log.writeln('\n\nCreating Elastic Search Form Index!');
            grunt.task.run('http:elasticCreateFormIndex');
        }
        if (grunt.config('elastic.form.river.create')) {
            grunt.log.writeln('\n\nCreating Elastic Search Form River!');
            grunt.task.run('http:elasticCreateFormRiver');
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
    grunt.registerTask('tarCode', function() {
        var done = this.async();
        var writeS = fs.createWriteStream('./code.tar.gz');
        writeS.on('close', function() {
            // tar done, now sign with gpg
            var gpg = spawn('gpg', ["-s", "./code.tar.gz"]);
            gpg.on('close', function(code){
                fs.unlinkSync("./code.tar.gz");
                done();
            });
        });
        var fixupDirs = function(entry) {
            // Make sure readable directories have execute permission
            if (entry.props.type === "Directory")
                entry.props.mode |= (entry.props.mode >>> 2) & 0111;
            return true;
        }

        return fstream.Reader({ path: config.node.buildDir, type: 'Directory', filter: fixupDirs }).pipe(
            tar.Pack()).pipe(zlib.createGzip()).pipe(writeS);
        //tar.pack(config.node.buildDir).pipe(gzip).pipe(writeS);
    });

    grunt.registerTask('git', 'Pull and merge the latest source-code from the Master branch.', ['prompt:git', 'do-git']);
    grunt.registerTask('elastic', 'Delete and re-create ElasticSearch index and its river.', ['prompt:elastic', 'do-elastic']);
    grunt.registerTask('node', 'Restart NodeJS server.', ['prompt:node', 'do-node']);
    grunt.registerTask('buildVersion',['shell:version','persistVersion']);
    grunt.registerTask('ingest',['prompt:ingest','do-ingest']);
    grunt.registerTask('tests',['prompt:testsLocation','do-test','clearQueue']);
    grunt.registerTask('bower',['bower-install-simple','bowercopy']);
    grunt.registerTask('refreplace-concat-minify', 'Run reference replacement, concatenation, minification build directory', ['useref', 'concat', 'uglify', 'cssmin']);
    grunt.registerTask('build', 'Download dependencies and copy application to its build directory.', function() {
        grunt.task.run('npm-install');
        if (config.node.buildDir) {
            grunt.task.run('copy');
            grunt.task.run('refreplace-concat-minify');
        }
    });
    grunt.registerTask('guihelp', ['prompt:help', 'do-help']);
    grunt.registerTask('default', 'The entire deployment process.', ['attention:welcome','divider','guihelp','divider','elastic','divider','bower-install-simple','divider','bowercopy','divider','build']);
    grunt.registerTask('help', ['availabletasks']);    
    grunt.registerTask('form-elastic', ['http:elasticDeleteFormRiver', 'http:elasticDeleteFormIndex', 'http:elasticCreateFormIndex', 'http:elasticCreateFormRiver']);
    // https://www.npmjs.org/package/grunt-bower-install-simple
    //grunt.registerTask("bower-install", [ "bower-install-simple" ]);
};