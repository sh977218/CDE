import { isEmpty } from 'lodash';
import { Form, FormSource } from 'server/form/mongo-form';
import { createLoincForm } from 'ingester/loinc/Form/form';
import {
    BATCHLOADER, compareElt, imported, lastMigrationScript, mergeElt, printUpdateResult, updateForm
} from 'ingester/shared/utility';
import { LoincLogger } from 'ingester/log/LoincLogger';

export async function runOneForm(loinc, classificationOrgName = 'LOINC', classificationArray = []) {
    const loincForm = await createLoincForm(loinc, classificationOrgName, classificationArray);
    const newForm = new Form(loincForm);
    const newFormObj = newForm.toObject();
    let existingForm = await Form.findOne({archived: false, 'ids.id': loinc['LOINC Code']});
    if (!existingForm) {
        existingForm = await newForm.save();
        LoincLogger.createdLoincForm++;
        LoincLogger.createdLoincForms.push(existingForm.tinyId);
    } else {
        const diff = compareElt(newForm.toObject(), existingForm.toObject());
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
        delete newFormObj.tinyId;
        delete newFormObj._id;
        newFormObj.attachments = [];
        const updateResult = await FormSource.updateOne({
            tinyId: existingForm.tinyId,
            source: 'LOINC'
        }, newFormObj, {upsert: true});
        printUpdateResult(updateResult, existingForm);
    }
    return existingForm;
}
