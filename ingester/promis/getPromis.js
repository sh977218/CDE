// 1) Downloads PROMIS from AC
// node ingester/promis/getPromis.js ../promis/ 2014-01

var fs = require('fs');
var fetch = require('node-fetch');

var promisDir = process.argv[2];
var formsDate = process.argv[3];
var allFiles = promisDir + "/allForms" + formsDate + ".json";

var sec = require('./sec');

var base64 = new Buffer(sec.regOID + ":" + sec.token).toString('base64');
var header = {'Authorization': "Basic " + base64};

var request = {
    url: 'https://www.assessmentcenter.net/ac_api/' + formsDate + '/Forms/.json',
    port: 443,
    headers: header
};


var req = fetch(request)
    .then(res => {
        console.log("statusCode: ", res.statusCode);
        return res.buffer();
    })
    .then(buffer => {
        fs.writeFile(allFiles, buffer);
        processForms();
    });

var processForms = function () {
    fs.readFile(allFiles, function (err, data) {
        var allForms = JSON.parse(data);
        allForms.Form.forEach(function (form) {
            var request = {
                url: 'https://www.assessmentcenter.net' + '/ac_api/' + formsDate + '/Forms/' + form.OID + '.json',
                port: 443,
                headers: header
            };

            console.log(form.Name);

            var req = fetch(request)
                .then(res => {
                    console.log("statusCode: ", res.statusCode);
                    return res.text();
                })
                .then(body => {
                    fs.writeFile(promisDir + "/forms" + formsDate + "/" + form.OID + ".json",
                        "{\"name\": \"" + form.Name + "\", \"content\":" + body + "}");
                }, err => {
                    console.log("**** no response for " + form.Name);
                });
        });

    });
};
