var mongo_data = require('../../../modules/system/node-js/mongo-data');

var ParseNaming = require('../Shared/ParseNaming');
var ParseIds = require('../Shared/ParseIds');
var ParseProperties = require('../Shared/ParseProperties');
var ParseReferenceDocuments = require('../Shared/ParseReferenceDocuments');
var ParseStewardOrg = require('../Shared/ParseStewardOrg');
var ParseValueDomain = require('./ParseValueDomain');
var ParseConcept = require('./ParseConcept');
var ParseSources = require('../Shared/ParseSources');

var today = new Date().toJSON();
var stewardOrgName = 'NLM';

exports.createCde = function (loinc, orgInfo) {
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
    var stewardOrg = ParseStewardOrg.parseStewardOrg(orgInfo);
    var sources = ParseSources.parseSources(loinc);
    var newCde = {
        tinyId: mongo_data.generateTinyId(),
        createdBy: {username: 'batchLoader'},
        created: today,
        imported: today,
        registrationState: {registrationStatus: "Qualified"},
        source: 'LOINC',
        sources: sources,
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