var sys = require('sys')
, exec = require('child_process').exec
, asyncblock = require('asyncblock')
, readline1 = require('readline-sync')
, config = require('../config.js')
, elastic = require('./elasticSearchInit.js')
, print = function(msg) { console.log("\n"+msg); };

//var exec = require('execSync');
//var exec = require('sync-exec');
//var exec = require('exec-sync');
//var exec = require('exec');

print('\nNLM CDE Deployment');

var execCallback = function(flowCb) {        
    return function (error, stdout, stderr) {      
        print('stdout: ' + stdout);
        //print('stderr: ' + stderr);
        if (error !== null) {
            print('exec error: ' + error);
        }
        flowCb();          
    };
};

var commandSettings = function(command, approvalNecessary) {
    this.command = command;
    this.messages = {
        executing: "Executing '" + this.command + "'",
        notexecuting: "Not Executing '" + this.command + "'",
        success: "Successfuly executed '" + this.command + "'"
    };
    this.approval = {
        necessary: approvalNecessary,
        question: "\nDo you want to execute '" + this.command + "' ?" 
    };
};

var commandService = function(flow, commandSettings, execCallback) {
    if (commandSettings.approval.necessary) {
        if (!readLineService(commandSettings.approval.question)) {
            print(commandSettings.messages.notexecuting);
            return;
        }
    }
    print(commandSettings.messages.executing);
    exec(commandSettings.command, new execCallback(flow.add()));
    flow.wait();
    print(commandSettings.messages.success);
};

var readLineService = function(question) {
    var answer = readline1.question(question);
    switch(answer) {
        case 'y':
        case 'yes':
        case 'Yes':   
        case 'Y':
            return true;
            break;
        case 'n':
        case 'no':
        case 'No':   
        case 'N':
            return false;
            break;                
        default:
            print('Answer not recognized. Treated as no.');
            return false;
            break;
    }
};

asyncblock(function(flow) {
    commandService(flow, new commandSettings("git pull origin master", true), execCallback);
    flow.wait(); 
    //commandService(flow, new commandSettings("curl -XDELETE " + config.elasticUri, true), execCallback);
    //flow.wait();    
    //commandService(flow, new commandSettings("curl -XPOST " + config.elasticUri + " -d '" + JSON.stringify(elastic.creadeIndexJson) + "'", true), execCallback);
    //flow.wait();
    //commandService(flow, new commandSettings("git pull origin master", true), execCallback);
    //flow.wait();


    // jiu jitsu
    /*var http = require('http');
    http.post = require('http-post');
    
    http.post(config.elasticUri, elastic.creadeIndexJson, function(res){
        res.on('data', function(chunk) {
            console.log(chunk);
        });
    }); */
    
    var rest = require('rest-js');

    var elastic = new rest.Rest(config.elastic.uri, {crossDomain: true});
    
    elastic.remove(config.elastic.index.name/*, null, flow.add()*/);
    flow.wait();
    console.log("done");
  
});