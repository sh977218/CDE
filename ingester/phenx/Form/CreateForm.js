const fs = require('fs');
const AdmZip = require('adm-zip');

const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;
const today = new Date().toJSON();

const batchloader = require('../../shared/updatedByLoader').batchloader;

const zipFolder = 's:/MLB/CDE/phenx/original-phenxtoolkit.rti.org/toolkit_content/redcap_zip/';

exports.createForm = async (measure, protocol) => {
    let protocolId = protocol.protocolId;
    let zipFile = zipFolder + 'PX' + protocolId + '.zip';
    if (fs.existsSync(zipFile)) {
        let zip = new AdmZip(zipFile);
        zip.extractAllTo(zipFolder + 'PX' + protocolId, true);
    }

    let designations = require('../Shared/ParseDesignations').parseDesignations(protocol);
    let definitions = require('../Shared/ParseDefinitions').parseDefinitions(protocol);
    let sources = require('../Shared/ParseSources').parseSources(protocol);
    let ids = require('../Shared/ParseIds').parseIds(protocol);
    let properties = require('../Shared/ParseProperties').parseProperties(measure, protocol);
    let referenceDocuments = require('../Shared/ParseReferenceDocuments').parseReferenceDocuments(protocol);
    let attachments = await require('./ParseAttachments').parseAttachments(protocol);
    let classification = require('../Shared/ParseClassification').parseClassification(measure);

    let newForm = {
        tinyId: generateTinyId(),
        createdBy: batchloader,
        sources,
        created: today,
        imported: today,
        isCopyrighted: false,
        noRenderAllowed: false,
        stewardOrg: {name: 'PhenX'},
        registrationState: {registrationStatus: "Candidate"},
        designations,
        definitions,
        referenceDocuments,
        ids,
        attachments,
        classification,
        properties,
        formElements: [],
        comments: []
    };

    await require('./ParseFormElements').parseFormElements(protocol, attachments, newForm);

    return newForm;
};