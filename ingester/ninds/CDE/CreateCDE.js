const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;

const NindsModel = require('../../createMigrationConnection').NindsModel;

const parseDesignations = require('./ParseDesignations').parseDesignations;
const parseDefinitions = require('./ParseDefinitions').parseDefinitions;
const parseSources = require('./ParseSources').parseSources;
const parseIds = require('./ParseIds').parseIds;
const parseProperties = require('./ParseProperties').parseProperties;
const parseReferenceDocuments = require('./ParseReferenceDocuments').parseReferenceDocuments;
const parseValueDomain = require('./ParseValueDomain').parseValueDomain;

const today = new Date().toJSON();
const batchloader = require('../../shared/updatedByNonLoader').batchloader;

exports.createCde = async cdeId => {
    let nindsForms = await NindsModel.find({'cdes.CDE ID': cdeId}, {
        diseaseName: 1,
        subDiseaseName: 1,
        formId: 1,
        cdes: {$elemMatch: {'CDE ID': cdeId}}
    }).lean();

    let designations = parseDesignations(nindsForms);
    let definitions = parseDefinitions(nindsForms);
    let sources = parseSources(nindsForms);
    let ids = parseIds(nindsForms);
    let properties = parseProperties(nindsForms);
    let referenceDocuments = parseReferenceDocuments(nindsForms);
    let classification = [];
    let valueDomain = parseValueDomain(nindsForms);

    let cde = {
        tinyId: generateTinyId(),
        sources,
        createdBy: batchloader,
        created: today,
        imported: today,
        stewardOrg: {name: 'NINDS'},
        designations: designations,
        definitions: definitions,
        sources: sources,
        ids: ids, properties: properties,
        referenceDocuments: referenceDocuments,
        valueDomain: valueDomain,
        classification: classification,
        registrationState: {registrationStatus: "Qualified"},
        comments: []
    };

    return cde;
};
