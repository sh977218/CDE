import { isEmpty } from 'lodash';
import { Form, updatePromise } from '../../../server/form/mongo-form';
import { batchloader, updatedByLoader } from '../../shared/updatedByLoader';
import { compareForm, createForm, mergeForm } from '../Form/form';

export async function runOneForm(loinc, orgInfo) {
    let formCond = {
        archived: false,
        "registrationState.registrationStatus": {$not: /Retired/},
        'ids.id': loinc.loincId
    };
    let existingForm = await Form.findOne(formCond).catch(e => {
        throw 'Error Form.findOne: ' + e;
    });
    let newFormObj = await createForm(loinc, orgInfo).catch(e => {
        throw 'Error CreateForm.createForm: ' + e;
    });
    let newForm = new Form(newFormObj);
    if (!existingForm) {
        existingForm = await newForm.save().catch(e => {
            throw 'Error newForm.save: ' + e;
        });
    } else if (updatedByLoader(existingForm)) {
    } else {
        existingForm.imported = new Date().toJSON();
        existingForm.markModified('imported');
        let diff = compareForm(newForm, existingForm);
        if (isEmpty(diff)) {
            await existingForm.save().catch(e => {
                throw 'Error existingForm.save: ' + e;
            });
        } else {
            await mergeForm(newForm, existingForm).catch(e => {
                throw 'Error MergeForm.mergeForm: ' + e;
            });
            await updatePromise(existingForm, batchloader).catch(e => {
                throw 'Error mongo_form.updatePromise: ' + e;
            });
        }
    }
    return existingForm;
}