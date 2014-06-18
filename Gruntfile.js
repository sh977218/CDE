var config = require('./config.js')
    , elastic = require('./deploy/elasticSearchInit.js')
    , chalk = require('chalk')
    , fs = require('fs');
    
var welcomeMessage = fs.readFileSync("./deploy/doc/welcome.txt");
var helpMessage = fs.readFileSync("./deploy/doc/help.txt");
var divider = "\n\n";

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
                    uri: config.elasticRiverUri
                    , method: 'POST'
                    , json: elastic.createRiverJson                   
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
        }    
        , copy: {
            main: {
                files: [
                    {
                        expand: true
                        , cwd: '.'
                        , src: [
                            'node-js/**'
                            , 'public/**'
                            , 'shared/**'
                            , 'views/**'
                            , 'config.js'
                            , 'node_modules/**'
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
                            , message: 'Do you want to ' + 'delete'.red  + ' Elastic Search ' + 'index?'.yellow
                        }
                        , {
                            config: 'elastic.index.create'
                            , type: 'confirm'
                            , message: 'Do you want to ' + 'create'.green  + ' Elastic Search ' + 'index?'.yellow
                        }
                        , {
                            config: 'elastic.river.delete'
                            , type: 'confirm'
                            , message: 'Do you want to ' + 'delete'.red  + ' Elastic Search ' + 'river?'.yellow
                        } 
                        , {
                            config: 'elastic.river.create'
                            , type: 'confirm'
                            , message: 'Do you want to ' + 'create'.green  + ' Elastic Search ' + 'river?'.yellow
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
                            type: 'list'
                            message: 'Main Menu',
                            default: 'Go!'
                            choices: ['Go!', 'Help!']
                        }
                    ]
                  }
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
    });  
    
    grunt.loadNpmTasks('grunt-git');
    grunt.loadNpmTasks('grunt-http');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-npm-install');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-available-tasks');
    grunt.loadNpmTasks('grunt-attention');
    
    grunt.registerTask('do-git', 'Restart NodeJS server.', function() {
        if (grunt.config('git.pull')) {
            grunt.task.run('gitpull');
        }     
    });     
    
    grunt.registerTask('do-elastic', function() {
        if (grunt.config('elastic.index.delete')) {
            grunt.log.writeln('\n\nDeleting Elastic Search Index!');
            grunt.task.run('http:elasticDeleteIndex');
        }
        if (grunt.config('elastic.index.create')) {
            grunt.log.writeln('\n\nCreating Elastic Search Index!');
            grunt.task.run('http:elasticCreateIndex');
        }
        if (grunt.config('elastic.river.delete')) {
            grunt.log.writeln('\n\nDeleting Elastic Search River!');
            grunt.task.run('http:elasticDeleteRiver');
        }
        if (grunt.config('elastic.river.create')) {
            grunt.log.writeln('\n\nCreating Elastic Search River!');
            grunt.task.run('http:elasticCreateRiver');
        }        
    });       
    
    grunt.registerTask('do-node', function() {
        if (grunt.config('elastic.index.delete')) {
            grunt.task.run('shell:stop');
        }
        if (grunt.config('elastic.index.create')) {
            grunt.task.run('shell:start');
        }      
    });  
    
    grunt.registerTask('clear', function() {
        console.log("\n\n");
    });     
    
    grunt.registerTask('do-help', function() {
        if (grunt.config('showHelp')) {
            grunt.task.run('attention:help');
        }    
    });    

    grunt.registerTask('git', 'Pull and merge the latest source-code from the Master branch.', ['prompt:git', 'do-git']);
    grunt.registerTask('elastic', 'Delete and re-create ElasticSearch index and its river.', ['prompt:elastic', 'do-elastic']);
    grunt.registerTask('node', 'Restart NodeJS server.', ['prompt:node', 'do-node']);
    grunt.registerTask('build', 'Download dependencies and copy application to its build directory.', ['npm-install', 'copy']);
    grunt.registerTask('help', ['prompt:help', 'do-help']);
    grunt.registerTask('default', 'The entire deployment process.', ['attention:welcome','clear','help','clear','git','clear', 'elastic','clear', 'build','clear', 'node']);
    grunt.registerTask('help', ['availabletasks']);
    

};