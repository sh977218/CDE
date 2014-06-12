var sys = require('sys')
, exec = require('child_process').exec
, asyncblock = require('asyncblock')
, readline1 = require('readline-sync');

//var exec = require('execSync');
//var exec = require('sync-exec');
//var exec = require('exec-sync');
//var exec = require('exec');

console.log('\nNLM CDE Deployment');

var execCallback = function(flowCb) {        
    return function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
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
        question: "Do you want to execute '" + this.command + "' ?" 
    };
};

var commandService = function(flow, commandSettings, execCallback) {
    if (commandSettings.approval.necessary) {
        if (!readLineService(commandSettings.approval.question)) {
            console.log(commandSettings.messages.notexecuting);
            return;
        }
    }
    console.log(commandSettings.messages.executing);
    exec(commandSettings.command, new execCallback(flow.add()));
    flow.wait();
    console.log(commandSettings.messages.success);
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
            console.log('Answer not recognized. Treated as no.');
            return false;
            break;
    }
};

asyncblock(function(flow) {
    commandService(flow, new commandSettings("git pull origin master", true), execCallback);
    flow.wait();   

});