var mongo_data = require('../../../server/system/mongo-data');

var ParseNaming = require('./ParseNaming');
var ParseIds = require('./ParseIds');
var ParseProperties = require('./ParseProperties');
var ParseReferenceDocuments = require('./ParseReferenceDocuments');
var ParseStewardOrg = require('./ParseStewardOrg');
var ParseClassification = require('./ParseClassification');

var today = new Date().toJSON();

exports.createElt = function (loinc, org, orgInfo, cb) {
    if (orgInfo['stewardOrgName'] === '') {
        console.log('StewardOrgName is empty.');
        process.exit(1);
    }
    if (orgInfo['classificationOrgName'] === '') {
        console.log('ClassificationOrgName is empty.');
        process.exit(1);
    }
    var naming = ParseNaming.parseNaming(loinc);
    var ids = ParseIds.parseIds(loinc);
    var properties = ParseProperties.parseProperties(loinc);
    var referenceDocuments = ParseReferenceDocuments.parseReferenceDocuments(loinc);
    var stewardOrg = ParseStewardOrg.parseStewardOrg(orgInfo);

    var newElt = {
        tinyId: mongo_data.generateTinyId(),
        createdBy: {username: 'BatchLoader'},
        created: today,
        imported: today,
        registrationState: {registrationStatus: "Qualified"},
        source: 'LOINC',
        naming: naming,
        ids: ids,
        properties: properties,
        referenceDocuments: referenceDocuments,
        stewardOrg: stewardOrg,
        classification: [{stewardOrg: {name: orgInfo['classificationOrgName']}, elements: []}]
    };
    ParseClassification.parseClassification(loinc, newElt, org, orgInfo['classificationOrgName'], orgInfo['classification'], function () {
        cb(newElt);
    })
};