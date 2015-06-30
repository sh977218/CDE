var fs = require('fs');
var request = require('request');

var promisDir = process.argv[2];
var allFiles = promisDir + "/allForms.json";

var sec = require("../" + promisDir + '/sec');

var base64 = new Buffer(sec.regOID + ":" + sec.token).toString('base64');
var header = {'Authorization': "Basic " + base64};

var options = {
    url: 'https://www.assessmentcenter.net/ac_api/2012-01/Forms/.json',
    port: 443,
    headers: header
};


var req = request(options, function (err, res, body) {
    console.log("statusCode: ", res.statusCode);
    //fs.writeFile(promisDir + "/allForms.json", body);
    processForms();
});

var processForms = function(){
    fs.readFile(allFiles, function(err, data) {
        var allForms = JSON.parse(data);
        allForms.Form.forEach(function(form) {
            var options = {
                url: 'https://www.assessmentcenter.net' + '/ac_api/2012-01/Forms/' + form.OID + '.json',
                port: 443,
                headers: header
            };

            console.log(form.Name);

            var req = request(options, function (err, res, body) {
                console.log("statusCode: ", res.statusCode);
                fs.writeFile(promisDir + "/forms/" + form.OID + ".json", "{\"name\": \"" + form.Name + "\", \"content\":" + body + "}");
            });
        });

    });
};