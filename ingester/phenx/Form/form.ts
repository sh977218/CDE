import { parseDesignations } from 'ingester/phenx/Shared/ParseDesignations';
import { parseDefinitions } from 'ingester/phenx/Shared/ParseDefinitions';
import { parseSources } from 'ingester/phenx/Shared/ParseSources';
import { parseIds } from 'ingester/phenx/Shared/ParseIds';
import { parseProperties } from 'ingester/phenx/Shared/ParseProperties';
import { parseReferenceDocuments } from 'ingester/phenx/Shared/ParseReferenceDocuments';
import { leadingZerosProtocolId, parseAttachments } from 'ingester/phenx/Form/ParseAttachments';
import { parseFormElements } from 'ingester/phenx/Form/ParseFormElements';
import { BATCHLOADER, created, imported, lastMigrationScript } from 'ingester/shared/utility';
import { generateTinyId } from 'server/system/mongo-data';
import { existsSync } from 'fs';
import * as AdmZip from 'adm-zip';
import { redCapZipFolder } from 'ingester/createMigrationConnection';
import { parseClassification } from 'ingester/phenx/Shared/ParseClassification';

function extractRedCapZip(protocolId) {
    const leadingZeroProtocolId = leadingZerosProtocolId(protocolId);
    const zipFile = redCapZipFolder + 'PX' + leadingZeroProtocolId + '.zip';
    if (existsSync(zipFile)) {
        const zip = new AdmZip(zipFile);
        zip.extractAllTo(redCapZipFolder + 'PX' + leadingZeroProtocolId, true);
    } else {
        console.log('RedCap zip not found. ' + protocolId);
    }
}

export async function createPhenxForm(protocol, isExistingFormQualified) {
    extractRedCapZip(protocol.protocolID);
    const designations = parseDesignations(protocol);
    const definitions = parseDefinitions(protocol);
    const sources = parseSources(protocol);
    const ids = parseIds(protocol);
    const properties = parseProperties(protocol);
    const referenceDocuments = parseReferenceDocuments(protocol);
    const attachments = await parseAttachments(protocol);
    const classification = parseClassification(protocol);

    const newForm = {
        elementType: 'form',
        tinyId: generateTinyId(),
        createdBy: BATCHLOADER,
        source: 'PhenX',
        sources,
        designations,
        definitions,
        referenceDocuments,
        ids,
        attachments,
        classification,
        properties,
        formElements: [],
        comments: [],
        created,
        imported,
        isCopyrighted: false,
        noRenderAllowed: false,
        stewardOrg: {name: 'PhenX'},
        registrationState: {registrationStatus: 'Candidate'},
        lastMigrationScript
    };

    await parseFormElements(protocol, attachments, newForm, isExistingFormQualified);
    return newForm;
}
