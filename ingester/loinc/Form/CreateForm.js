const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;

const ParseDesignations = require('../Shared/ParseDesignations');
const ParseDefinitions = require('../Shared/ParseDefinitions');
const ParseIds = require('../Shared/ParseIds');
const ParseProperties = require('../Shared/ParseProperties');
const ParseReferenceDocuments = require('../Shared/ParseReferenceDocuments');
const ParseStewardOrg = require('../Shared/ParseStewardOrg');
const ParseSources = require('../Shared/ParseSources');

const ParseFormElements = require('./ParseFormElements');


const today = new Date().toJSON();
const ParseClassification = require('../Shared/ParseClassification');

exports.createForm = function (loinc, orgInfo) {
    return new Promise(async (resolve, reject) => {
        let designations = ParseDesignations.parseDesignations(loinc);
        let definitions = ParseDefinitions.parseDefinitions(loinc);
        let ids = ParseIds.parseIds(loinc);
        let properties = ParseProperties.parseProperties(loinc);
        let referenceDocuments = ParseReferenceDocuments.parseReferenceDocuments(loinc);
        let stewardOrg = ParseStewardOrg.parseStewardOrg(orgInfo);
        let sources = ParseSources.parseSources(loinc);
        let classification = await ParseClassification.parseClassification(loinc, orgInfo);

        let formElements = await ParseFormElements.parseFormElements(loinc, orgInfo);
        let newForm = {
            tinyId: generateTinyId(),
            createdBy: {username: 'batchloader'},
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