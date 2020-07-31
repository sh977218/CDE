import { sortBy } from 'lodash';
import * as DiffJson from 'diff-json';
import { generateTinyId } from 'server/system/mongo-data';
import {
    BATCHLOADER, created, imported, lastMigrationScript, mergeDefinitions, mergeDesignations, mergeProperties,
    mergeReferenceDocuments
} from 'ingester/shared/utility';
import { parseNinrDesignations } from 'ingester/Ninr/csv/cde/ParseDesignations';
import { parseNinrDefinitions } from 'ingester/Ninr/csv/cde/ParseDefinitions';
import { parseNinrSources } from 'ingester/Ninr/csv/cde/ParseSources';
import { mergeNinrIds, parseNinrIds } from 'ingester/Ninr/csv/cde/ParseIds';
import { parseNinrValueDomain } from 'ingester/Ninr/csv/cde/ParseValueDomain';
import { parseNinrReferenceDocuments } from 'ingester/Ninr/csv/cde/ParseReferenceDocuments';
import { parseNinrProperties } from 'ingester/Ninr/csv/cde/ParseProperties';
import { parseNinrClassification } from 'ingester/Ninr/csv/cde/ParseClassification';
import { parseNinrAttachments } from 'ingester/ninr/csv/cde/ParseAttachments';
import { dataElementSourceModel } from 'server/cde/mongo-cde';

export async function createNinrCde(ninrRow, source) {
    const designations = parseNinrDesignations(ninrRow);
    const definitions = parseNinrDefinitions(ninrRow);
    const sources = parseNinrSources(source);

    const valueDomain = parseNinrValueDomain(ninrRow);

    const ids = parseNinrIds(ninrRow);
    const referenceDocuments = await parseNinrReferenceDocuments(ninrRow);
    const properties = parseNinrProperties(ninrRow);
    const attachments = parseNinrAttachments();
    const classification = parseNinrClassification();

    const ninrCde: any = {
        tinyId: generateTinyId(),
        source: 'NINR',
        sources,
        stewardOrg: {
            name: 'NINR'
        },
        registrationState: {
            registrationStatus: 'Qualified'
        },
        createdBy: BATCHLOADER,
        lastMigrationScript,
        changeNote: lastMigrationScript,
        created,
        imported,
        designations,
        definitions,
        valueDomain,
        referenceDocuments,
        attachments,
        properties,
        ids,
        classification
    };
    return ninrCde;
}

function createNinrCompareObj(elt) {
    return {
        designations: sortBy(elt.designations, ['designation']),
        definitions: sortBy(elt.definitions, ['definition']),
        properties: sortBy(elt.properties, ['key']),
        referenceDocuments: sortBy(elt.referenceDocuments, ['docType', 'languageCode', 'document']),
        ids: sortBy(elt.ids.filter(id => id.source === 'BRICS Variable Name'), ['source', 'id']),
    };
}

export function compareNinrCde(existingCdeObj, newCdeObj) {
    const newCdeObjCompare = createNinrCompareObj(newCdeObj);
    const existingCdeObjCompare = createNinrCompareObj(existingCdeObj);
    return DiffJson.diff(newCdeObjCompare, existingCdeObjCompare);
}

export function mergeNinrCde(existingCdeObj, newCdeObj) {
    mergeDesignations(existingCdeObj, newCdeObj);
    mergeDefinitions(existingCdeObj, newCdeObj);

    mergeNinrIds(existingCdeObj, newCdeObj);
    mergeProperties(existingCdeObj, newCdeObj);
    mergeReferenceDocuments(existingCdeObj, newCdeObj);
}

export async function updateNinrRawArtifact(tinyId, cdeObj) {
    delete cdeObj.tinyId;
    delete cdeObj._id;
    cdeObj.classification = cdeObj.classification.filter(c => c.stewardOrg.name === 'NINR');
    const updateResult = await dataElementSourceModel.updateOne({
        tinyId, source: 'NINR'
    }, cdeObj, {upsert: true});
    if (updateResult.nModified) {
        console.log(`${updateResult.nModified} cde Raw Artifact modified: ${tinyId}`);
    }
    if (updateResult.upserted && updateResult.upserted.length) {
        console.log(`${updateResult.upserted.length} cde} Raw Artifact inserted: ${tinyId}`);
    }
}
