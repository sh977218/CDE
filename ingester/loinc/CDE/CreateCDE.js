const mongo_data = require('../../../server/system/mongo-data');

const ParseDesignations = require('../Shared/ParseDesignations');
const ParseDefinitions = require('../Shared/ParseDefinitions');
const ParseIds = require('../Shared/ParseIds');
const ParseProperties = require('../Shared/ParseProperties');
const ParseReferenceDocuments = require('../Shared/ParseReferenceDocuments');
const ParseStewardOrg = require('../Shared/ParseStewardOrg');
const ParseValueDomain = require('./ParseValueDomain');
const ParseConcept = require('./ParseConcept');
const ParseSources = require('../Shared/ParseSources');

const today = new Date().toJSON();
const stewardOrgName = 'NLM';

exports.createCde = function (loinc, orgInfo) {
    if (stewardOrgName == '') {
        console.log('StewardOrgName is empty. Please set it first.');
        process.exit(1);
    }
    let designations = ParseDesignations.parseDesignations(loinc);
    let definitions = ParseDefinitions.parseDefinitions(loinc);
    let ids = ParseIds.parseIds(loinc);
    let properties = ParseProperties.parseProperties(loinc);
    let referenceDocuments = ParseReferenceDocuments.parseReferenceDocuments(loinc);
    let valueDomain = ParseValueDomain.parseValueDomain(loinc);
    let concepts = ParseConcept.parseConcepts(loinc);
    let stewardOrg = ParseStewardOrg.parseStewardOrg(orgInfo);
    let sources = ParseSources.parseSources(loinc);
    let newCde = {
        tinyId: mongo_data.generateTinyId(),
        createdBy: {username: 'batchLoader'},
        created: today,
        imported: today,
        registrationState: {registrationStatus: "Qualified"},
        sources: sources,
        designations: designations,
        definitions: definitions,
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