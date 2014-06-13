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
                        return JSON.stringify(elastic.creadeIndexJson);
                    }
                }
            }   
        }        
    });
    grunt.loadNpmTasks('grunt-git');
    grunt.loadNpmTasks('grunt-http');
    grunt.registerTask('elastic', ['http:elasticDeleteIndex', 'http:elasticCreateIndex']);
    grunt.registerTask('default', ['gitpull','elastic']);
};