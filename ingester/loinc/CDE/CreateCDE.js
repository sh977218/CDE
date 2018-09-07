const _ = require('lodash');

const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;

const ParseDesignations = require('../Shared/ParseDesignations');
const ParseDefinitions = require('../Shared/ParseDefinitions');
const ParseIds = require('../Shared/ParseIds');
const ParseProperties = require('../Shared/ParseProperties');
const ParseReferenceDocuments = require('../Shared/ParseReferenceDocuments');
const ParseStewardOrg = require('../Shared/ParseStewardOrg');
const ParseSources = require('../Shared/ParseSources');

const ParseValueDomain = require('./ParseValueDomain');
const ParseConcept = require('./ParseConcept');

const orgMapping = require('../Mapping/ORG_INFO_MAP').map;

const today = new Date().toJSON();
const stewardOrgName = 'NLM';
const ParseClassification = require('../Shared/ParseClassification');

exports.createCde = function (loinc, orgName) {
    let orgInfo = orgMapping[orgName];
    return new Promise(async (resolve, reject) => {
        if (_.isEmpty(stewardOrgName)) reject('StewardOrgName is empty. Please set it first.');

        let designations = ParseDesignations.parseDesignations(loinc);
        let definitions = ParseDefinitions.parseDefinitions(loinc);
        let ids = ParseIds.parseIds(loinc);
        let properties = ParseProperties.parseProperties(loinc);
        let referenceDocuments = ParseReferenceDocuments.parseReferenceDocuments(loinc);
        let valueDomain = ParseValueDomain.parseValueDomain(loinc);
        let concepts = ParseConcept.parseConcepts(loinc);
        let stewardOrg = ParseStewardOrg.parseStewardOrg(orgInfo);
        let sources = ParseSources.parseSources(loinc);
        let classification = await ParseClassification.parseClassification(loinc, orgInfo);

        let newCde = {
            tinyId: generateTinyId(),
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
            classification: classification
        };
        resolve(newCde);
    })

};