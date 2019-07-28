import { isEmpty } from 'lodash';
import { DataElement, DataElementSource } from 'server/cde/mongo-cde';
import { createCde } from 'ingester/loinc/CDE/cde';
import {
    batchloader, compareElt, imported, lastMigrationScript, mergeElt, printUpdateResult, updateCde
} from 'ingester/shared/utility';

export async function runOneCde(loinc, orgInfo) {
    const loincId = loinc.loincId;
    let newCdeObj = await createCde(loinc, orgInfo);
    const newCde = new DataElement(newCdeObj);
    newCdeObj = newCde.toObject();
    let existingCde = await DataElement.findOne({archived: false, 'ids.id': loincId});
    if (!existingCde) {
        existingCde = await newCde.save();
    } else {
        existingCde.imported = imported;
        existingCde.lastMigrationScript = lastMigrationScript;
        existingCde.changeNote = lastMigrationScript;
        const existingCdeObj = existingCde.toObject();
        const diff = compareElt(newCdeObj, existingCdeObj, 'LOINC');
        if (isEmpty(diff)) {
            await existingCde.save();
        } else {
            mergeElt(newCdeObj, existingCdeObj, 'LOINC');
            await updateCde(existingCde, batchloader, {updateSource: true});
        }
    }
    delete newCdeObj.tinyId;
    newCdeObj.attachments = [];
    const updateResult = await DataElementSource.updateOne({tinyId: existingCde.tinyId}, newCdeObj, {upsert: true});
    printUpdateResult(updateResult, existingCde);
    return existingCde;
}