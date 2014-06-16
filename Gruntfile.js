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
        /*, http: {
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
                    , form: elastic.createIndexJson
                    , 'content-type': 'application/json'
                    , json: elastic.createIndexJson
                    , body: function() {
                        return JSON.stringify(elastic.createIndexJson);
                    }                
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
                    , headers: {'Content-type': 'application/json', 'Content-Length': JSON.stringify(elastic.createRiverJson).length}
                    , body: JSON.stringify(elastic.createRiverJson)
                    , form: elastic.createRiverJson                  
                }
            }             
        }
        , curl: {
            'createIndex': {
                src: {
                    url: config.elasticUri,
                    method: 'POST',
                    body: JSON.stringify(elastic.createRiverJson),
                    json: elastic.createRiverJson                         
                }
            }
        }*/

        , shell: {                               
            elasticDeleteIndex: {                     
                command: 'curl -XDELETE ' + config.elasticUri
            }
            , elasticCreateIndex: {                        
                command: 'curl -XPOST ' + config.elasticUri + ' -d\'' + JSON.stringify(elastic.createIndexJson) + '\''
            }   
            , elasticDeleteRiver: {                        
                command: 'curl -XDELETE ' + config.elasticRiverUri
            }
            , elasticCreateRiver: {                        
                command: 'curl -XPOST ' + config.elasticRiverUri + ' -d\'' + JSON.stringify(elastic.createRiverJson) + '\''
            }             
        }
        
        , exec: {
            elasticCreateRiver: {
                cmd: function() {
                    var command = 'curl -XPOST ' + config.elasticRiverUri + ' -d\'' + JSON.stringify(elastic.createRiverJson) + '\'';
                    return command;
                }
            }
        }        


        ,'node-inspector': {
            dev: {}
        }
    });
    console.log('curl -XPOST ' + config.elasticRiverUri + ' -d\'' + JSON.stringify(elastic.createRiverJson) + '\'');
    
    grunt.loadNpmTasks('grunt-node-inspector');
    
    grunt.loadNpmTasks('grunt-git');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-exec');
    //grunt.loadNpmTasks('grunt-http');
    //grunt.loadNpmTasks('grunt-curl');
    grunt.registerTask('git', ['gitpull']);
    //grunt.registerTask('elastic', ['http']);
    grunt.registerTask('default', [/*'git','elastic'*/'curl']);
    
};