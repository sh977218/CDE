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
                    url: config.elasticUri
                    , method: 'DELETE'
                }
            }               
            , elasticCreateIndex: {
                options: {
                    url: config.elasticUri
                    , method: 'POST'
                    , body: function() {
                        return JSON.stringify(elastic.createIndexJson);
                    }
                }
            } 
            , elasticDeleteRiver: {
                options: {
                    url: config.elasticRiverUri
                    , method: 'DELETE'
                }
            }
            , elasticCreateRiver: {
                options: {
                    url: config.elasticRiverUri
                    , method: 'POST'
                    , body: function() {
                        return JSON.stringify(elastic.createRiverJson);                       
                    }                    
                }
            }             
        }   
        
        ,'node-inspector': {
            dev: {}
        }
    });
    grunt.loadNpmTasks('grunt-node-inspector');
    
    grunt.loadNpmTasks('grunt-git');
    grunt.loadNpmTasks('grunt-http');
    grunt.registerTask('git', ['gitpull']);
    grunt.registerTask('elastic', ['http']);
    grunt.registerTask('default', ['git','elastic']);
    
};