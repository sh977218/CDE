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
            elasticIndex: {
                options: {
                    url: config.elasticUri
                    , method: 'POST'
                }
            }   
        }        
    });

    grunt.loadNpmTasks('grunt-git');
    grunt.loadNpmTasks('grunt-http');
    grunt.registerTask('default', ['gitpull','http']);

};