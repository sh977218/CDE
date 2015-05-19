var request = require('request')
    , xml2js = require('xml2js')
    , fs = require('fs')
    , beautify = require("json-beautify");
;

var parser = new xml2js.Parser();


request('http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML?query=gov.nih.nci.cadsr.domain.ClassificationScheme&gov.nih.nci.cadsr.domain.ClassificationScheme&startIndex=0&pageSize=2000&resultCounter=2000',
    function (error, response, body) {
    var finalMapping = {};
    if (!error && response.statusCode == 200) {
        parser.parseString(body, function(err, jsonRes){
            jsonRes['xlink:httpQuery'].queryResponse[0]['class'].forEach(function(thisClass){
                var returnObj = {};
                thisClass.field.forEach(function(field){
                    if (field['$'].name === "publicID") returnObj.publicID = field['_'];
                    if (field['$'].name === "version") returnObj.version = field['_'];
                    if (field['$'].name === "longName") returnObj.longName = field['_'];
                    if (field['$'].name === "workflowStatusName") returnObj.workflowStatusName = field['_'];
                });
                //finalMapping.push(returnObj);
                finalMapping[returnObj.publicID+"v"+returnObj.version] = {
                    longName: returnObj.longName
                    , workflowStatusName: returnObj.workflowStatusName
                };
            });
        });
        console.log(finalMapping.length);
        fs.writeFile("./classifMapping.js", beautify(finalMapping, null, 2, 1000), function(){});
    }
});