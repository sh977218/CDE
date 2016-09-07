var mongo_data = require('../../../../modules/system/node-js/mongo-data');

var ParseNaming = require('./.././ParseNaming');
var ParseIds = require('./.././ParseIds');
var ParseProperties = require('./.././ParseProperties');
var ParseReferenceDocuments = require('./.././ParseReferenceDocuments');
var ParseStewardOrg = require('./.././ParseStewardOrg');
var ParseValueDomain = require('./ParseValueDomain');
var ParseConcept = require('./ParseConcept');

var today = new Date().toJSON();
var stewardOrgName = 'NLM';

exports.setStewardOrg = function (o) {
    var stewardOrgName = o;
};

exports.createCde = function (loinc) {
    if (stewardOrgName === '') {
        console.log('StewardOrgName is empty. Please set it first.');
        process.exit(1);
    }
    var naming = ParseNaming.parseNaming(loinc);
    var ids = ParseIds.parseIds(loinc);
    var properties = ParseProperties.parseProperties(loinc);
    var referenceDocuments = ParseReferenceDocuments.parseReferenceDocuments(loinc);
    var valueDomain = ParseValueDomain.parseValueDomain(loinc);
    var concepts = ParseConcept.parseConcepts(loinc);
    var stewardOrg = ParseStewardOrg.parseStewardOrg();
    var newCde = {
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
        objectClass: {concepts: concepts.objectClass},
        property: {concepts: concepts.property},
        dataElementConcept: {concepts: concepts.dataElementConcept},
        stewardOrg: stewardOrg,
        valueDomain: valueDomain,
        classification: []
    };
    return newCde;
};