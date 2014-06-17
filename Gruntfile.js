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
                            ,'config.js'
                            ,'node_modules/**'
                        ]
                        , dest: config.node.rundir
                    }
                ]
            }
        }        
        //, 'node-inspector': { dev: {} }
    });
    
    //grunt.loadNpmTasks('grunt-node-inspector');    
    //grunt.loadNpmTasks('grunt-debug-task');    
    
    grunt.loadNpmTasks('grunt-git');
    grunt.loadNpmTasks('grunt-http');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('git', ['gitpull']);
    grunt.registerTask('elastic', ['http']);
    grunt.registerTask('node', ['shell']);
};