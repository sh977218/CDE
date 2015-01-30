var fs = require('fs');
var https = require('https');

var promisDir = process.argv[2];
var allFiles = promisDir + "/allForms.json";

var sec = require("../" + promisDir + '/sec');

var base64 = new Buffer(sec.regOID + ":" + sec.token).toString('base64');
var header = {'Authorization': "Basic " + base64};

fs.readFile(allFiles, function(err, data) {
    var allForms = JSON.parse(data);
    allForms.Form.forEach(function(form) {
        var options = {
            hostname: 'www.assessmentcenter.net',
            port: 443,
            path: '/ac_api/2012-01/Forms/' + form.OID + '.json',
            method: 'GET',
            headers: header
        };

        console.log(form.Name);
 
        var req = https.request(options, function (res) {
            console.log("statusCode: ", res.statusCode);
            console.log("headers: ", res.headers);

            res.on('data', function (d) {
                fs.writeFile(promisDir + "/forms/" + form.OID + ".json", d);
            });
        });
        req.end();
    });
    
});