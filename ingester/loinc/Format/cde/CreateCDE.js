var mongo_data = require('../../../../modules/system/node-js/mongo-data');

var ParseNaming = require('./../Shared/ParseNaming');
var ParseIds = require('./../Shared/ParseIds');
var ParseProperties = require('./../Shared/ParseProperties');
var ParseReferenceDocuments = require('./../Shared/ParseReferenceDocuments');
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
        stewardOrg: {name: stewardOrgName},
        valueDomain: valueDomain,
        classification: []
    };
    return newCde;
};