var config = require('./config.js')
    , elastic = require('./deploy/elasticSearchInit.js');

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
        , availabletasks: {
            help: {
                options: {
                    filter: 'include',
                    tasks: ['git', 'elastic', 'build', 'node']
                }                
            }
        }        
    });  
    
    grunt.loadNpmTasks('grunt-git');
    grunt.loadNpmTasks('grunt-http');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-npm-install');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-available-tasks');    
    grunt.registerTask('git', 'Pull and merge the latest source-code from the Master branch.', ['gitpull']);
    grunt.registerTask('elastic', 'Delete and re-create ElasticSearch index and its river.', ['http']);
    grunt.registerTask('node', 'Restart NodeJS server.', ['shell']);
    grunt.registerTask('build', 'Download dependencies and copy application to its build directory.', ['npm-install', 'copy']);
    grunt.registerTask('help', ['availabletasks']);
};