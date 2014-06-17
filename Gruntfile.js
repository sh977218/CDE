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
        
        , 'node-inspector': {
            dev: {}
        }
    });
    
    grunt.registerMultiTask('elastic', 'Elastic Service', function() {        
        /*console.log("URL: " + this.data.url);
        console.log("METHOD: " + this.data.method);
        if (this.data.json) console.log("CONTENT: " + JSON.stringify(this.data.json));
        var headers = {
            'Content-Type': 'application/json'
            , 'Content-Length': this.data.json?this.data.json.length:0
        };
        var options = {
            host: this.data.url
            , method: this.data.method
            , headers: headers
        };        
        var http = require('http');
        var req = http.request(options, function(res1,res2,res3) {
        console.log("cb");
        });
        req.write(JSON.stringify(this.data.json), function() {console.log("cb2");});
        req.end(); */
        
        /*var request = require('request');

        var options = {
            uri: this.data.url
            , method: this.data.method
            , json: this.data.json
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(response); // Print the shortened url.
            }
        });*/        
    });    
    
    grunt.loadNpmTasks('grunt-node-inspector');    
    grunt.loadNpmTasks('grunt-debug-task');
    
    grunt.loadNpmTasks('grunt-git');
    grunt.loadNpmTasks('grunt-http');
    //grunt.registerTask('default', ['gitpull','http']);
    
};