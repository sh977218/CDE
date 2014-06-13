var config = require('./config.js')
    /*, elastic = require('./deploy/elasticSearchInit.js')*/;

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
        /*, http: {
            createIndex: {
                options: {
                    url: config.elasticUri
                    , method: 'POST'
                    , body: function() {
                        return JSON.stringify(elastic.creadeIndexJson);
                    }
                }
            }
        }*/
    });
    grunt.loadNpmTasks(['grunt-git'/*, 'grunt-http'*/]);
    grunt.registerTask('default', ['gitpull'/*, 'http'*/]);
    //grunt.registerTask('elastic', ['http']);
};