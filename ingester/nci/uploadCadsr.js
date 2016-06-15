var fs = require('fs'),
    https = require('https'),
    async = require('async'),
    xml2js = require('xml2js'),
    shortid = require('shortid'),
    Readable = require('stream').Readable,
    entities = require("entities"),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    config = require('config'),
    
    classificationShared = require('../../modules/system/shared/classificationShared'),
    mongo_data_system = require('../../modules/system/node-js/mongo-data'),
    classifMapping = require('./classifMapping.json')
    ;


var parser = new xml2js.Parser();
var builder = new xml2js.Builder();

var cadsrFolder = process.argv[2];
if (!cadsrFolder) {
    console.log("missing cadsrFolder arg");
    process.exit(1);
}

var datatypeMapping = {
    CHARACTER: "Text"
    , NUMBER: "Number"
    , ALPHANUMERIC: "Text"
    , TIME: "Time"
    , DATE: "Date"
    , DATETIME: "Date/Time"
};

var phenxOrg = null;
var nciOrg = null;

mongo_data_system.orgByName("PhenX", function (stewardOrg) {
    phenxOrg = stewardOrg;
    if (!phenxOrg) {
        throw "PhenX Org does not exists!";
    }
});
mongo_data_system.orgByName("NCI", function (stewardOrg) {
    nciOrg = stewardOrg;
    if (!nciOrg) {
        throw "NCI Org does not exists!";
    }
});

setTimeout(function () {
    doFile(cadsrFolder, function () {
        console.log("single file done");
        phenxOrg.save(function (err) {
            if (err) throw "Cannot save Phenx!";
            nciOrg.save(function (err) {
                if (err) throw "Cannot save NCI org!";
                process.exit(0);
            });
        });
    });
}, 2000);
