import { sortBy, isEmpty } from 'lodash';
import * as DiffJson from 'diff-json';
import { generateTinyId } from 'server/system/mongo-data';
import {
    BATCHLOADER, created, findOneCde, imported, lastMigrationScript, NINR_SOCIAL_DETERMINANTS_OF_HEALTH, updateCde
} from 'ingester/shared/utility';
import { mergeNinrDesignations, parseNinrDesignations } from 'ingester/Ninr/csv/cde/ParseDesignations';
import { mergeNinrDefinitions, parseNinrDefinitions } from 'ingester/Ninr/csv/cde/ParseDefinitions';
import { addNinrSource, parseNinrSources } from 'ingester/Ninr/csv/cde/ParseSources';
import { mergeNinrIds, parseNinrIds } from 'ingester/Ninr/csv/cde/ParseIds';
import { parseNinrValueDomain } from 'ingester/Ninr/csv/cde/ParseValueDomain';
import { mergeNinrProperties, parseNinrProperties } from 'ingester/Ninr/csv/cde/ParseProperties';
import { addNinrClassification, parseNinrClassification } from 'ingester/Ninr/csv/cde/ParseClassification';
import { parseNinrAttachments } from 'ingester/ninr/csv/cde/ParseAttachments';
import { dataElementModel, dataElementSourceModel } from 'server/cde/mongo-cde';
import { getCell } from 'ingester/ninds/csv/shared/utility';
import { CdeForm } from 'shared/form/form.model';
import {
    mergeNinrReferenceDocuments, parseNinrReferenceDocuments
} from 'ingester/ninr/csv/cde/ParseReferenceDocuments';


let updatedDeCount = 0;
let newDeCount = 0;
let sameDeCount = 0;

export async function createNinrCde(ninrRow: any) {
    const designations = parseNinrDesignations(ninrRow);
    const definitions = parseNinrDefinitions(ninrRow);
    const sources = parseNinrSources();

    const valueDomain = parseNinrValueDomain(ninrRow);

    const ids = parseNinrIds(ninrRow);
    const referenceDocuments = await parseNinrReferenceDocuments(ninrRow);
    const properties = parseNinrProperties(ninrRow);
    const attachments = parseNinrAttachments();
    const classification = parseNinrClassification();

    const ninrCde: any = {
        tinyId: generateTinyId(),
        source: NINR_SOCIAL_DETERMINANTS_OF_HEALTH,
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

function createNinrCompareObj(elt: CdeForm) {
    return {
        designations: sortBy(elt.designations, ['designation']),
        definitions: sortBy(elt.definitions, ['definition']),
        properties: sortBy(elt.properties, ['key']),
        referenceDocuments: sortBy(elt.referenceDocuments, ['docType', 'languageCode', 'document']),
        ids: sortBy(elt.ids.filter(id => id.source === 'BRICS Variable Name'), ['source', 'id']),
    };
}

export function compareNinrCde(existingCdeObj: CdeForm, newCdeObj: CdeForm) {
    const newCdeObjCompare = createNinrCompareObj(newCdeObj);
    const existingCdeObjCompare = createNinrCompareObj(existingCdeObj);
    return DiffJson.diff(newCdeObjCompare, existingCdeObjCompare);
}

export function mergeNinrCde(existingCdeObj: CdeForm,
                             newCdeObj: CdeForm,
                             otherSourceRawArtifacts: CdeForm[]) {
    mergeNinrDesignations(existingCdeObj, newCdeObj, otherSourceRawArtifacts);
    mergeNinrDefinitions(existingCdeObj, newCdeObj, otherSourceRawArtifacts);
    mergeNinrIds(existingCdeObj, newCdeObj, otherSourceRawArtifacts);
    mergeNinrProperties(existingCdeObj, newCdeObj, otherSourceRawArtifacts);
    mergeNinrReferenceDocuments(existingCdeObj, newCdeObj, otherSourceRawArtifacts);
}

export async function updateNinrRawArtifact(tinyId: string, cdeObj: CdeForm) {
    delete cdeObj.tinyId;
    delete cdeObj._id;
    cdeObj.classification = cdeObj.classification.filter(c => c.stewardOrg.name === 'NINR');
    const updateResult = await dataElementSourceModel.updateOne({
        tinyId,
        source: NINR_SOCIAL_DETERMINANTS_OF_HEALTH
    }, cdeObj, {upsert: true});
    if (updateResult.nModified) {
        console.log(`${updateResult.nModified} cde Raw Artifact modified: ${tinyId}`);
    }
    if (updateResult.upserted && updateResult.upserted.length) {
        console.log(`${updateResult.upserted.length} cde Raw Artifact inserted: ${tinyId}`);
    }
}

export async function runOneNinrDataElement(ninrCsvRow: any) {
    const variableName = getCell(ninrCsvRow, 'variable name');
    const newCdeObj = await createNinrCde(ninrCsvRow);

    const newCde = new dataElementModel(newCdeObj);
    const cond = {
        archived: false,
        'registrationState.registrationStatus': {$ne: 'Retired'},
        ids: {
            $elemMatch: {
                source: 'BRICS Variable Name',
                id: variableName
            }
        },
    };
    const existingCdes = await dataElementModel.find(cond);
    const existingCde = findOneCde(existingCdes, variableName);
    if (!existingCde) {
        const newCdeSaved = await newCde.save().catch((err: any) => {
            console.log(`Not able to save new NINR cde ${newCde.tinyId} ${err}`);
            process.exit(1);
        });
        newDeCount++;
        console.log(`newDeCount: ${newDeCount} newDe ${newCde.tinyId}`);
        await updateNinrRawArtifact(newCde.tinyId, newCdeObj);
        return newCdeSaved;
    } else {
        const existingCdeObj = existingCde.toObject();
        const diff = compareNinrCde(existingCdeObj, newCdeObj)
        if (isEmpty(diff)) {
            addNinrClassification(existingCde, newCde.toObject());
            addNinrSource(existingCde, newCde.toObject());
            existingCde.lastMigrationScript = lastMigrationScript;
            existingCde.imported = imported;
            const sameCdeSaved = await existingCde.save().catch((err: any) => {
                console.log(`Not able to save same NINR cde ${existingCde.tinyId} ${err}`);
                process.exit(1);
            });
            sameDeCount++;
            console.log(`sameDeCount: ${sameDeCount} sameCdeSaved ${sameCdeSaved.tinyId}`);
            await updateNinrRawArtifact(existingCdeObj.tinyId, newCde.toObject());
            return sameCdeSaved;
        } else {
            const existingOtherSourceRawArtifacts = await dataElementSourceModel.find({
                tinyId: existingCdeObj.tinyId,
                source: {
                    $ne: 'NINR'
                }
            }).lean();
            mergeNinrCde(existingCdeObj, newCde.toObject(), existingOtherSourceRawArtifacts);
            addNinrClassification(existingCdeObj, newCde.toObject());
            addNinrSource(existingCdeObj, newCde.toObject());
            existingCdeObj.lastMigrationScript = lastMigrationScript;
            existingCdeObj.imported = imported;
            existingCdeObj.changeNote = lastMigrationScript;
            const updatedCdeSaved: any = await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true}).catch((err: any) => {
                console.log(`Not able to update existing NINR cde ${existingCde.tinyId} ${err}`);
                process.exit(1);
            });
            updatedDeCount++;
            console.log(`updatedDeCount: ${updatedDeCount} updateCdeSaved ${existingCde.tinyId}`);
            await updateNinrRawArtifact(existingCdeObj.tinyId, newCdeObj);
            return updatedCdeSaved;
        }
    }
}

