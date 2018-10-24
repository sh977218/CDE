const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;

const parseDesignations = require('./ParseDesignations').parseDesignations;
const parseDefinitions = require('./ParseDefinitions').parseDefinitions;
const parseSources = require('./ParseSources').parseSources;
const parseIds = require('./ParseIds').parseIds;
const parseProperties = require('./ParseProperties').parseProperties;
const parseReferenceDocuments = require('./ParseReferenceDocuments').parseReferenceDocuments;
const parseClassification = require('../Shared/ParseClassification').parseClassification;
const parseFormElements = require('./ParseFormElements').parseFormElements;
const parseCopyright = require('./ParseCopyright').parseCopyright;
const today = new Date().toJSON();

exports.createForm = async nindsForms => {
    let designations = parseDesignations(nindsForms);
    let definitions = parseDefinitions(nindsForms);
    let sources = parseSources(nindsForms);
    let ids = parseIds(nindsForms);
    let properties = parseProperties(nindsForms);
    let referenceDocuments = parseReferenceDocuments(nindsForms);
    let formElements = await parseFormElements(nindsForms);

    let isCopyrighted = parseCopyright(nindsForms);

    let newForm = {
        tinyId: generateTinyId(),
        createdBy: {username: 'batchloader'},
        sources: sources,
        created: today,
        imported: today,
        isCopyrighted: isCopyrighted,
        noRenderAllowed: isCopyrighted,
        stewardOrg: {name: 'NINDS'},
        registrationState: {registrationStatus: "Qualified"},
        designations: designations,
        definitions: definitions,
        referenceDocuments: referenceDocuments,
        ids: ids,
        classification: [],
        properties: properties,
        formElements: formElements
    };

    parseClassification(nindsForms, newForm);

    return newForm;
};
