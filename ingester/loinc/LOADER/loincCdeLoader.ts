import { isEmpty } from 'lodash';
import { DataElement, DataElementSource } from 'server/cde/mongo-cde';
import { createCde } from 'ingester/loinc/CDE/cde';
import {
    batchloader, compareElt, imported, lastMigrationScript, mergeElt, printUpdateResult, updateCde
} from 'ingester/shared/utility';

export async function runOneCde(loinc, orgInfo) {
    let loincId = loinc.loincId;
    let newCdeObj = await createCde(loinc, orgInfo);
    let newCde = new DataElement(newCdeObj);
    newCdeObj = newCde.toObject();
    let existingCde = await DataElement.findOne({archived: false, 'ids.id': loincId});
    if (!existingCde) {
        existingCde = await newCde.save();
    } else {
        existingCde.imported = imported;
        existingCde.lastMigrationScript = lastMigrationScript;
        existingCde.changeNote = lastMigrationScript;
        let diff = compareElt(newCdeObj, existingCde, 'LOINC');
        if (isEmpty(diff)) {
            await existingCde.save();
        } else {
            let existingCdeObj = existingCde.toObject();
            mergeElt(newCdeObj, existingCdeObj, 'LOINC');
            await updateCde(existingCde, batchloader, {updateSource: true});
        }
    }
    delete newCdeObj.tinyId;
    newCdeObj.attachments = [];
    let updateResult = await DataElementSource.updateOne({tinyId: existingCde.tinyId}, newCdeObj, {upsert: true});
    printUpdateResult(updateResult, existingCde);
    return existingCde;
}