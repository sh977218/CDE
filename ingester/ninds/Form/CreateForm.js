import { BATCHLOADER } from 'ingester/shared/utility';

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
        elementType: 'form',
        source: 'NINDS',
        tinyId: generateTinyId(),
        sources,
        createdBy: BATCHLOADER,
        created: today,
        imported: today,
        isCopyrighted,
        noRenderAllowed: isCopyrighted,
        stewardOrg: {name: 'NINDS'},
        registrationState: {registrationStatus: "Qualified"},
        designations,
        definitions,
        referenceDocuments,
        ids,
        classification: [],
        properties,
        formElements,
        comments: []
    };

    parseClassification(nindsForms, newForm);

    return newForm;
};
