import { parseDesignations } from 'ingester/phenx/Shared/ParseDesignations';
import { parseDefinitions } from 'ingester/phenx/Shared/ParseDefinitions';
import { parseSources } from 'ingester/phenx/Shared/ParseSources';
import { parseIds } from 'ingester/phenx/Shared/ParseIds';
import { parseProperties } from 'ingester/phenx/Shared/ParseProperties';
import { parseReferenceDocuments } from 'ingester/phenx/Shared/ParseReferenceDocuments';
import { leadingZerosProtocolId, parseAttachments } from 'ingester/phenx/Form/ParseAttachments';
import { parseClassification } from 'ingester/phenx/Shared/ParseClassification';
import { parseFormElements } from 'ingester/phenx/Form/ParseFormElements';
import {
    batchloader, created, imported, mergeBySource, mergeSourcesBySourceName, replaceClassificationByOrg
} from 'ingester/shared/utility';
import { generateTinyId } from 'server/system/mongo-data';
import { existsSync } from "fs";
import * as AdmZip from 'adm-zip';
import { redCapZipFolder } from 'ingester/createMigrationConnection';


function extractRedCapZip(protocolId) {
    let leadingZeroProtocolId = leadingZerosProtocolId(protocolId);
    let zipFile = redCapZipFolder + 'PX' + leadingZeroProtocolId + '.zip';
    if (existsSync(zipFile)) {
        let zip = new AdmZip(zipFile);
        zip.extractAllTo(redCapZipFolder + 'PX' + leadingZeroProtocolId, true);
    } else {
        console.log('RedCap zip not found. ' + protocolId);
    }
}

export async function createForm(protocol) {
    extractRedCapZip(protocol.protocolID);
    let designations = parseDesignations(protocol);
    let definitions = parseDefinitions(protocol);
    let sources = parseSources(protocol);
    let ids = parseIds(protocol);
    let properties = parseProperties(protocol);
    let referenceDocuments = parseReferenceDocuments(protocol);
    let attachments = await parseAttachments(protocol);
    let classification = parseClassification(protocol);

    let newForm = {
        elementType: 'form',
        tinyId: generateTinyId(),
        createdBy: batchloader,
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
        registrationState: {registrationStatus: "Candidate"},
        lastMigrationScript: 'loadPhenXJuly2019'
    };

    await parseFormElements(protocol, attachments, newForm);
    return newForm;
}

export function mergeForm(existingForm, newForm) {
    let sourceName = 'PhenX';
    existingForm.designations = newForm.designations;
    existingForm.definitions = newForm.definitions;
    existingForm.ids = mergeBySource(newForm.ids, existingForm.ids, sourceName);
    existingForm.properties = mergeBySource(newForm.properties, existingForm.properties, sourceName);
    existingForm.referenceDocuments = mergeBySource(newForm.referenceDocuments, existingForm.referenceDocuments, sourceName);
    existingForm.attachments = newForm.attachments;
    existingForm.sources = mergeSourcesBySourceName(newForm.sources, existingForm.sources, sourceName);
    existingForm.classification = replaceClassificationByOrg(newForm.classification, existingForm.classification, 'PhenX');
    existingForm.version = newForm.version;

    // Liz make those 50 forms qualified, We don't want to modify.
    if (existingForm.registrationState.registrationStatus !== 'Qualified') {
        existingForm.formElements = newForm.formElements;
    }
}