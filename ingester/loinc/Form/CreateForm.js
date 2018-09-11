const _ = require('lodash');

const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;

const ParseDesignations = require('../Shared/ParseDesignations');
const ParseDefinitions = require('../Shared/ParseDefinitions');
const ParseIds = require('../Shared/ParseIds');
const ParseProperties = require('../Shared/ParseProperties');
const ParseReferenceDocuments = require('../Shared/ParseReferenceDocuments');
const ParseStewardOrg = require('../Shared/ParseStewardOrg');
const ParseSources = require('../Shared/ParseSources');

const ParseFormElements = require('./ParseFormElements');

const orgMapping = require('../Mapping/ORG_INFO_MAP').map;

const today = new Date().toJSON();
const stewardOrgName = 'NLM';
const ParseClassification = require('../Shared/ParseClassification');

exports.createForm = function (loinc, orgName) {
    let orgInfo = orgMapping[orgName];
    return new Promise(async (resolve, reject) => {
        if (_.isEmpty(stewardOrgName)) reject('StewardOrgName is empty. Please set it first.');

        let designations = ParseDesignations.parseDesignations(loinc);
        let definitions = ParseDefinitions.parseDefinitions(loinc);
        let ids = ParseIds.parseIds(loinc);
        let properties = ParseProperties.parseProperties(loinc);
        let referenceDocuments = ParseReferenceDocuments.parseReferenceDocuments(loinc);
        let stewardOrg = ParseStewardOrg.parseStewardOrg(orgInfo);
        let sources = ParseSources.parseSources(loinc);
        let classification = await ParseClassification.parseClassification(loinc, orgInfo);

        let formElements = await ParseFormElements.parseFormElements(loinc);
        let newForm = {
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
            stewardOrg: stewardOrg,
            classification: classification,
            formElements: formElements
        };
        resolve(newForm);
    })

};