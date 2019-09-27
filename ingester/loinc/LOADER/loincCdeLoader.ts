import { isEmpty } from 'lodash';
import { DataElement } from 'server/cde/mongo-cde';
import { createLoincCde } from 'ingester/loinc/CDE/cde';
import {
    BATCHLOADER, compareElt, imported, lastMigrationScript, mergeClassification, mergeElt, updateCde, updateRowArtifact
} from 'ingester/shared/utility';

import { LoincLogger } from 'ingester/log/LoincLogger';

export async function runOneCde(loinc, classificationOrgName, classificationArray = []) {
    if (!classificationOrgName) {
        console.log('loincCdeLoader.ts classificationOrgName is empty.');
        process.exit(1);
    }
    const loincCde = await createLoincCde(loinc, classificationOrgName, classificationArray);
    const newCde = new DataElement(loincCde);
    const newCdeObj = newCde.toObject();
    let existingCde: any = await DataElement.findOne({archived: false, 'ids.id': loinc['LOINC Code']});
    if (!existingCde) {
        existingCde = await newCde.save().catch(err => {
            console.log(`LOINC existingCde = await newCde.save() error: ${JSON.stringify(err)}`);
            process.exit(1);
        });
        LoincLogger.createdLoincCde++;
        LoincLogger.createdLoincCdes.push(existingCde.tinyId + `[${loinc['LOINC Code']}]`);
    } else {
        const diff = compareElt(newCde.toObject(), existingCde.toObject(), 'LOINC');
        mergeClassification(existingCde, newCde.toObject(), classificationOrgName);
        if (isEmpty(diff)) {
            existingCde.lastMigrationScript = lastMigrationScript;
            existingCde.imported = imported;
            await existingCde.save().catch(err => {
                console.log(existingCde);
                console.log('LOINC await existingCde.save() error: ' + err);
                process.exit(1);
            });
            LoincLogger.sameLoincCde++;
            LoincLogger.sameLoincCdes.push(existingCde.tinyId);
        } else {
            const existingCdeObj = existingCde.toObject();
            mergeElt(existingCdeObj, newCdeObj, 'LOINC', classificationOrgName);
            await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true}).catch(err => {
                console.log(newCdeObj);
                console.log(existingCdeObj);
                console.log(`LOINC await updateCde(existingCdeObj error: ${JSON.stringify(err)}`);
                process.exit(1);
            });
            LoincLogger.changedLoincCde++;
            LoincLogger.changedLoincCdes.push(existingCde.tinyId);
        }
    }
    await updateRowArtifact(existingCde, newCdeObj, 'LOINC', classificationOrgName);
    const savedCde: any = await DataElement.findOne({archived: false, 'ids.id': loinc['LOINC Code']});
    return savedCde;
}
