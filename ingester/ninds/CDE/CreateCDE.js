const _ = require('lodash');
const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;

const MigrationNindsModel = require('../../createMigrationConnection').MigrationNindsModel;

const parseDesignations = require('./ParseDesignations').parseDesignations;
const parseDefinitions = require('./ParseDefinitions').parseDefinitions;
const parseSources = require('./ParseSources').parseSources;
const parseIds = require('./ParseIds').parseIds;
const parseProperties = require('./ParseProperties').parseProperties;
const parseReferenceDocuments = require('./ParseReferenceDocuments').parseReferenceDocuments;
const parseValueDomain = require('./ParseValueDomain').parseValueDomain;


exports.createCde = async cdeId => {
    let nindsForms = await MigrationNindsModel.find({'cdes.cdeId': cdeId}, {
        diseaseName: 1,
        subDiseaseName: 1,
        formId: 1,
        cdes: {$elemMatch: {cdeId: cdeId}}
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
        designations: designations,
        definitions: definitions,
        sources: sources,
        ids: ids, properties: properties,
        referenceDocuments: referenceDocuments,
        valueDomain: valueDomain,
        classification: classification
    };

    return cde;
};
