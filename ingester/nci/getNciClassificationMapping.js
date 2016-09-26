var fs = require('fs'),
    request = require('request'),
    beautify = require("json-beautify"),
    parseString = require('xml2js').parseString
    ;

function run(next) {
    fs.readFile('./caDSRClassificationMapping', function (err) {
        if (err) {
            console.log('classification map does not find. retrieve it now');
            request('http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML?query=gov.nih.nci.cadsr.domain.ClassificationScheme&gov.nih.nci.cadsr.domain.ClassificationScheme&startIndex=0&pageSize=2000&resultCounter=2000',
                function (error, response, body) {
                    var finalMapping = {};
                    if (!error && response.statusCode == 200) {
                        parseString(body, function (err, jsonRes) {
                            jsonRes['xlink:httpQuery'].queryResponse[0]['class'].forEach(function (thisClass) {
                                var returnObj = {};
                                thisClass.field.forEach(function (field) {
                                    if (field['$'].name === "publicID") returnObj.publicID = field['_'];
                                    if (field['$'].name === "version") returnObj.version = field['_'];
                                    if (field['$'].name === "longName") returnObj.longName = field['_'];
                                    if (field['$'].name === "workflowStatusName") returnObj.workflowStatusName = field['_'];
                                });
                                //finalMapping.push(returnObj);
                                finalMapping[returnObj.publicID + "v" + returnObj.version] = {
                                    longName: returnObj.longName,
                                    workflowStatusName: returnObj.workflowStatusName
                                };
                            });
                        });
                        console.log("Classifications obtained.");
                        fs.writeFile("./ingester/nci/caDSRClassificationMapping.json", beautify(finalMapping, null, 2, 1000), function () {
                            var classificationMapping = require('./caDSRClassificationMapping.json');
                            if (next) next();
                            else process.exit(1);
                        });
                    }
                });
        }
        else {
            console.log('classification map found.');
            if (next) next();
            else process.exit(1);
        }
    })
}
run();