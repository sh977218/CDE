import { isEmpty } from 'lodash';
import { Form } from 'server/form/mongo-form';
import { compareForm, createForm, mergeForm } from '../Form/form';
import { BATCHLOADER, updatedByLoader, updateForm } from 'ingester/shared/utility';

export async function runOneForm(loinc, orgInfo) {
    let formCond = {
        archived: false,
        "registrationState.registrationStatus": {$not: /Retired/},
        'ids.id': loinc.loincId
    };
    let existingForm = await Form.findOne(formCond);
    let newFormObj = await createForm(loinc, orgInfo);
    let newForm = new Form(newFormObj);
    if (!existingForm) {
        existingForm = await newForm.save();
    } else if (updatedByLoader(existingForm)) {
    } else {
        existingForm.imported = new Date().toJSON();
        existingForm.markModified('imported');
        let diff = compareForm(newForm, existingForm);
        if (isEmpty(diff)) {
            await existingForm.save();
        } else {
            await mergeForm(newForm, existingForm);
            await updateForm(existingForm, BATCHLOADER);
        }
    }
    return existingForm;
}