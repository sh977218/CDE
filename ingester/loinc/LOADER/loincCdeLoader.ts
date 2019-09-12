import { isEmpty } from 'lodash';
import { DataElement, DataElementSource } from 'server/cde/mongo-cde';
import { createLoincCde } from 'ingester/loinc/CDE/cde';
import {
    BATCHLOADER, compareElt, imported, lastMigrationScript, mergeElt, printUpdateResult, updateCde
} from 'ingester/shared/utility';

import { LoincLogger } from 'ingester/log/LoincLogger';

export async function runOneCde(loinc, orgInfo) {
    const loincCde = await createLoincCde(loinc, orgInfo);
    const newCde = new DataElement(loincCde);
    const newCdeObj = newCde.toObject();
    let existingCde = await DataElement.findOne({archived: false, 'ids.id': loinc.loincId});
    if (!existingCde) {
        existingCde = await newCde.save().catch(err => {
            console.log('LOINC existingCde = await newCde.save() error: ' + err);
            process.exit(1);
        });
        LoincLogger.createdLoincCde++;
        LoincLogger.createdLoincCdes.push(existingCde.tinyId);
    } else {
        const diff = compareElt(newCde.toObject(), existingCde.toObject());
        if (isEmpty(diff)) {
            existingCde.lastMigrationScript = lastMigrationScript;
            existingCde.imported = imported;
            await existingCde.save().catch(err => {
                console.log('LOINC await existingCde.save() error: ' + err);
                process.exit(1);
            });
            LoincLogger.sameLoincCde++;
            LoincLogger.sameLoincCdes.push(existingCde.tinyId);
        } else {
            const existingCdeObj = existingCde.toObject();
            mergeElt(existingCdeObj, newCdeObj, orgInfo.classificationOrgName);
            await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true}).catch(err => {
                console.log('LOINC await updateCde(existingCdeObj error: ' + err);
                process.exit(1);
            });
            LoincLogger.changedLoincCde++;
            LoincLogger.changedLoincCdes.push(existingCde.tinyId);
        }
    }
    delete newCdeObj.tinyId;
    delete newCdeObj._id;
    newCdeObj.attachments = [];
    const updateResult = await DataElementSource.updateOne({
        tinyId: existingCde.tinyId,
        source: 'LOINC'
    }, newCdeObj, {upsert: true});
    printUpdateResult(updateResult, existingCde);
    return existingCde;
}
