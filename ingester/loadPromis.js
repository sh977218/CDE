var fs = require('fs')
var https = require('https');

var promisDir = process.argv[2];
var allFiles = promisDir + "/allForms.json";

var sec = require("../" + promisDir + '/sec');

var base64 = new Buffer(sec.regOID + ":" + sec.token).toString('base64');
var header = {'Authorization': "Basic " + base64};

fs.readdir(promisDir + "/forms", function(err, files) {
    if (err) {
        console.log("Cant read form dir." + err);
        process.exit(1);
    }
    files.forEach(function(form) {
        
    });
});