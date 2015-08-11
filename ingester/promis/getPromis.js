var fs = require('fs');
var request = require('request');

var promisDir = process.argv[2];
var formsDate = process.argv[3];
var allFiles = promisDir + "/allForms" + formsDate + ".json";

var sec = require('./sec');

var base64 = new Buffer(sec.regOID + ":" + sec.token).toString('base64');
var header = {'Authorization': "Basic " + base64};

var options = {
    url: 'https://www.assessmentcenter.net/ac_api/' + formsDate + '/Forms/.json',
    port: 443,
    headers: header
};


var req = request(options, function (err, res, body) {
    console.log("statusCode: ", res.statusCode);
    fs.writeFile(allFiles, body);
    processForms();
});

var processForms = function(){
    fs.readFile(allFiles, function(err, data) {
        var allForms = JSON.parse(data);
        allForms.Form.forEach(function(form) {
            var options = {
                url: 'https://www.assessmentcenter.net' + '/ac_api/' + formsDate + '/Forms/' + form.OID + '.json',
                port: 443,
                headers: header
            };

            console.log(form.Name);

            var req = request(options, function (err, res, body) {
                console.log("statusCode: ", res.statusCode);
                fs.writeFile(promisDir + "/forms" + formsDate + "/" + form.OID + ".json", "{\"name\": \"" + form.Name + "\", \"content\":" + body + "}");
            });
        });

    });
};