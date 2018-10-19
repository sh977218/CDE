const _ = require('lodash');

const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;
const DataElement = require('../../../server/cde/mongo-cde').DataElement;

const CreateCDE = require('../CDE/CreateCDE');
const today = new Date().toJSON();

exports.createForm = async (measure, protocol) => {
    let designations = require('../Shared/ParseDesignations').parseDesignations(protocol);
    let definitions = require('../Shared/ParseDefinitions').parseDefinitions(protocol);
    let sources = require('../Shared/ParseSources').parseSources(protocol);
    let ids = require('../Shared/ParseIds').parseIds(protocol);
    let properties = require('../Shared/ParseProperties').parseProperties(measure, protocol);
    let referenceDocuments = require('../Shared/ParseReferenceDocuments').parseReferenceDocuments(protocol);
    let classification = require('../Shared/ParseClassification').parseClassification(measure);
    let formElements = await require('ParseFormElements').parseFormElements(protocol);

    let newForm = {
        tinyId: generateTinyId(),
        createdBy: {username: 'batchloader'},
        sources: sources,
        created: today,
        imported: today,
        isCopyrighted: false,
        noRenderAllowed: false,
        stewardOrg: {name: 'PhenX'},
        registrationState: {registrationStatus: "Qualified"},
        designations: designations,
        definitions: definitions,
        referenceDocuments: referenceDocuments,
        ids: ids,
        classification: classification,
        properties: properties,
        formElements: formElements
    };

    return newForm;
};