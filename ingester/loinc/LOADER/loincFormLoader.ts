import { isEmpty } from 'lodash';
import { Form, FormSource } from 'server/form/mongo-form';
import { createForm } from 'ingester/loinc/Form/form';
import {
    batchloader, compareElt, imported, lastMigrationScript, mergeElt, printUpdateResult, updateForm
} from 'ingester/shared/utility';

export async function runOneForm(loinc, orgInfo) {
    let formCond = {archived: false, 'ids.id': loinc.loincId};
    let newFormObj = await createForm(loinc, orgInfo);
    let newForm = new Form(newFormObj);
    newFormObj = newForm.toObject();
    let existingForm = await Form.findOne(formCond);
    if (!existingForm) {
        existingForm = await newForm.save();
    } else {
        existingForm.imported = imported;
        existingForm.lastMigrationScript = lastMigrationScript;
        existingForm.changeNote = lastMigrationScript;
        let diff = compareElt(newForm.toObject(), existingForm.toObject(), 'LOINC');
        if (isEmpty(diff)) {
            await existingForm.save();
        } else {
            let existingFormObj = existingForm.toObject();
            mergeElt(existingFormObj, newFormObj, 'LOINC');
            await updateForm(existingForm, batchloader, {updateSource: true});
        }
        delete newFormObj['tinyId'];
        newFormObj.attachments = [];
        let updateResult = await FormSource.updateOne({tinyId: existingForm.tinyId}, newFormObj, {upsert: true});
        printUpdateResult(updateResult, existingForm);
    }
    return existingForm;
}