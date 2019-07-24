import { parseDesignations } from 'ingester/phenx/Shared/ParseDesignations';
import { parseDefinitions } from 'ingester/phenx/Shared/ParseDefinitions';
import { parseSources } from 'ingester/phenx/Shared/ParseSources';
import { parseIds } from 'ingester/phenx/Shared/ParseIds';
import { parseProperties } from 'ingester/phenx/Shared/ParseProperties';
import { parseReferenceDocuments } from 'ingester/phenx/Shared/ParseReferenceDocuments';
import { parseAttachments } from 'ingester/phenx/Form/ParseAttachments';
import { parseClassification } from 'ingester/phenx/Shared/ParseClassification';
import { parseFormElements } from 'ingester/phenx/Form/ParseFormElements';
import {
    batchloader, created, imported, mergeBySource, replaceClassificationByOrg, tinyId
} from 'ingester/shared/utility';


export async function createForm(protocol) {
    let designations = parseDesignations(protocol);
    let definitions = parseDefinitions(protocol);
    let sources = parseSources(protocol);
    let ids = parseIds(protocol);
    let properties = parseProperties(protocol);
    let referenceDocuments = parseReferenceDocuments(protocol);
    let attachments = await parseAttachments(protocol).catch(e => {
        throw "Error await require('./ParseAttachments').parseAttachments(protocol): " + e;
    });
    let classification = parseClassification(protocol);

    let newForm = {
        tinyId,
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
    existingForm.sources = mergeBySource(newForm.sources, existingForm.sources, sourceName);
    existingForm.classification = replaceClassificationByOrg(newForm.classification, existingForm.classification, 'PhenX');

    // Liz make those 50 forms qualified, We don't want to modify.
    if (existingForm.registrationState.registrationStatus !== 'Qualified') {
        existingForm.formElements = newForm.formElements;
    }
}