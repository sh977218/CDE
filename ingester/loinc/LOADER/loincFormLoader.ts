import { isEmpty } from 'lodash';
import { formModel } from 'server/form/mongo-form';
import { createLoincForm } from 'ingester/loinc/Form/form';
import {
    BATCHLOADER, compareElt, imported, lastMigrationScript, mergeClassification, mergeElt, updateForm, updateRawArtifact
} from 'ingester/shared/utility';
import { LoincLogger } from 'ingester/log/LoincLogger';

export async function runOneForm(loinc, classificationOrgName = 'LOINC', classificationArray = []) {
    const loincForm = await createLoincForm(loinc, classificationOrgName, classificationArray);
    const newForm = new formModel(loincForm);
    const newFormObj = newForm.toObject();
    let existingForm = await formModel.findOne({archived: false, 'ids.id': loinc['LOINC Code']});
    if (!existingForm) {
        existingForm = await newForm.save();
        LoincLogger.createdLoincForm++;
        LoincLogger.createdLoincForms.push(existingForm.tinyId + `[${loinc['LOINC Code']}]`);
    } else {
        const diff = compareElt(newForm.toObject(), existingForm.toObject(), 'LOINC');
        mergeClassification(existingForm, newForm.toObject(), classificationOrgName);
        if (isEmpty(diff)) {
            existingForm.lastMigrationScript = lastMigrationScript;
            existingForm.imported = imported;
            await existingForm.save();
            LoincLogger.sameLoincForm++;
            LoincLogger.sameLoincForms.push(existingForm.tinyId);
        } else {
            const existingFormObj = existingForm.toObject();
            mergeElt(existingFormObj, newFormObj, 'LOINC');
            await updateForm(existingFormObj, BATCHLOADER, {updateSource: true});
            LoincLogger.changedLoincForm++;
            LoincLogger.changedLoincForms.push(existingForm.tinyId);
        }

        await updateRawArtifact(existingForm, newFormObj, 'LOINC', classificationOrgName);
    }
    return existingForm;
}
