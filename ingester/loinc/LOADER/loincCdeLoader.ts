import { isEmpty } from 'lodash';
import { DataElement, DataElementSource } from 'server/cde/mongo-cde';
import { createLoincCde } from 'ingester/loinc/CDE/cde';
import {
    batchloader, compareElt, imported, lastMigrationScript, mergeElt, printUpdateResult, updateCde
} from 'ingester/shared/utility';

export async function runOneCde(loinc, orgInfo, source) {
    const loincCde = await createLoincCde(loinc, orgInfo, source);
    const newCde = new DataElement(loincCde);
    const newCdeObj = newCde.toObject();
    let existingCde = await DataElement.findOne({archived: false, 'ids.id': loinc.loincId});
    if (!existingCde) {
        existingCde = await newCde.save();
    } else {
        const existingCdeObj = existingCde.toObject();
        existingCdeObj.imported = imported;
        existingCdeObj.lastMigrationScript = lastMigrationScript;
        existingCdeObj.changeNote = lastMigrationScript;
        const diff = compareElt(newCde.toObject(), existingCde.toObject(), 'LOINC');
        if (isEmpty(diff)) {
            await existingCde.save();
        } else {
            mergeElt(newCdeObj, existingCdeObj, 'LOINC');
            await updateCde(existingCde, batchloader, {updateSource: true});
        }
    }
    delete newCdeObj.tinyId;
    delete newCdeObj._id;
    newCdeObj.attachments = [];
    const updateResult = await DataElementSource.updateOne({tinyId: existingCde.tinyId}, newCdeObj, {upsert: true});
    printUpdateResult(updateResult, existingCde);
    return existingCde;
}
