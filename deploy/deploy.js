var sys = require('sys');

var exec = require('child_process').exec;
//var exec = require('execSync');
//var exec = require('sync-exec');
//var exec = require('exec-sync');
//var exec = require('exec');

//var asyncblock = require('asyncblock');

console.log('\nNLM CDE Deployment');

var execCallback = function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
        console.log('exec error: ' + error);
    }
};

var commandSettings = function(command, approvalNecessary) {
    this.command = command;
    this.messages = {
        executing: "Executing " + this.command,
        success: this.command + " Done."
    };
    this.approval = {
        necessary: approvalNecessary,
        question: "Do you want to execute '" + this.command + "' ?" 
    };
};


var commandService = function(flow, commandSettings, execCallback) {
    if (commandSettings.approval.necessary) {
        console.log(commandSettings.approval.question);
    }
    console.log(commandSettings.messages.executing);
    exec(commandSettings.command, flow.add()/*execCallback*/);
    flow.wait();
    console.log(commandSettings.messages.success);
};



asyncblock(function(flow) {
    commandService(flow, new commandSettings("git pull origin master", true), execCallback);
    flow.wait();
    console.log("next command");    
});