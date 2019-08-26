import { existsSync } from 'fs';
import { generateTinyId } from 'server/system/mongo-data';
import { BATCHLOADER, created, imported } from 'ingester/shared/utility';
import { parseDesignations } from 'ingester/phenx/Shared/ParseDesignations';
import { parseDefinitions } from 'ingester/phenx/Shared/ParseDefinitions';
import { parseSources } from 'ingester/phenx/Shared/ParseSources';
import { parseIds } from 'ingester/phenx/Shared/ParseIds';
import { parseProperties } from 'ingester/phenx/Shared/ParseProperties';
import { parseReferenceDocuments } from 'ingester/phenx/Shared/ParseReferenceDocuments';
import { parseAttachments } from 'ingester/phenx/Form/ParseAttachments';
import { parseClassification } from 'ingester/phenx/Shared/ParseClassification';
import { parseFormElements } from 'ingester/phenx/Form/ParseFormElements';

const AdmZip = require('adm-zip');

const zipFolder = 's:/MLB/CDE/phenx/original-phenxtoolkit.rti.org/toolkit_content/redcap_zip/';

exports.createForm = async (measure, protocolObj) => {
    let protocolId = protocolObj.protocolId;
    let protocol = protocolObj.protocol;
    let zipFile = zipFolder + 'PX' + protocolId + '.zip';
    if (existsSync(zipFile)) {
        let zip = new AdmZip(zipFile);
        zip.extractAllTo(zipFolder + 'PX' + protocolId, true);
    }

    let designations = parseDesignations(protocol);
    let definitions = parseDefinitions(protocol);
    let sources = parseSources(protocol);
    let ids = parseIds(protocolObj);
    let properties = parseProperties(measure, protocol);
    let referenceDocuments = parseReferenceDocuments(protocol);
    let attachments = await parseAttachments(protocol);
    let classification = parseClassification(measure);

    let newForm = {
        tinyId: generateTinyId(),
        createdBy: BATCHLOADER,
        sources,
        created: created,
        imported: imported,
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

    await parseFormElements(protocol, attachments, newForm);

    return newForm;
};
