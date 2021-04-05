const fs = require('fs');
const beautify = require("json-beautify");
const fetch = require('node-fetch');
const parseString = require('xml2js').parseString;

function retrieveClassificationMapping() {
    let url = 'http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML?query=gov.nih.nci.cadsr.domain.ClassificationScheme&gov.nih.nci.cadsr.domain.ClassificationScheme&startIndex=0&pageSize=2000&resultCounter=2000';
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(res => {
                if (res.status !== 200) {
                    reject(res.status + ' ' + res.statusText);
                    return;
                }
                return res.text();
            })
            .then(body => {
                let finalMapping = {};
                parseString(body, function (err, jsonRes) {
                    jsonRes['xlink:httpQuery'].queryResponse[0]['class'].forEach(function (thisClass) {
                        let returnObj = {};
                        thisClass.field.forEach(function (field) {
                            if (field['$'].name === "publicID") returnObj.publicID = field['_'];
                            if (field['$'].name === "version") returnObj.version = field['_'];
                            if (field['$'].name === "longName") returnObj.longName = field['_'];
                            if (field['$'].name === "workflowStatusName") returnObj.workflowStatusName = field['_'];
                        });
                        finalMapping[returnObj.publicID + "v" + returnObj.version] = {
                            longName: returnObj.longName,
                            workflowStatusName: returnObj.workflowStatusName
                        };
                    });
                });
                console.log("Classifications obtained.");
                resolve(finalMapping);
            }, reject);
    })
}

function run() {
    fs.readFile(__dirname + '/caDSRClassificationMapping', async function (err) {
        if (err) {
            console.log('classification map does not find. retrieve it now');
            let finalMapping = await retrieveClassificationMapping();
            fs.writeFile(__dirname + "/caDSRClassificationMapping.json", beautify(finalMapping, null, 2, 1000), function () {
            });
        } else console.log('classification map found.');
    })
}

run();