import { isEmpty, words } from 'lodash';
import {
    BATCHLOADER, compareElt, imported, lastMigrationScript, mergeElt, printUpdateResult, updateForm
} from 'ingester/shared/utility';
import { Form, FormSource } from 'server/form/mongo-form';
import { createNindsForm } from 'ingester/ninds/csv/form/form';

function convertFileNameToFormName(fullFileName: string) {
    const trimmedFileName = fullFileName
        .replace('.csv', '')
        .replace('.xlsx').trim();
    const terms = words(trimmedFileName);
    return terms.filter(t => !isEmpty(t) && isNaN(t)).join(' ');
}

export async function loadFormByCsv(rows: any[], csvFileName: string) {
    const formName = convertFileNameToFormName(csvFileName);
    const nindsForm = await createNindsForm(formName, rows);
    const newForm = new Form(nindsForm);
    const newFormObj = newForm.toObject();
    let existingForm = await Form.findOne({archived: false, 'designations.designation': formName});
    if (!existingForm) {
        existingForm = await newForm.save().catch((e: any) => {
            console.log('await newForm.save().catch: ' + e);
            process.exit(1);
        });
        console.log(`created form: ${formName} tinyId: ${existingForm.tinyId}`);
    } else {
        const diff = compareElt(newForm.toObject(), existingForm.toObject());
        if (isEmpty(diff)) {
            existingForm.imported = imported;
            existingForm.lastMigrationScript = lastMigrationScript;
            await existingForm.save().catch((e: any) => {
                console.log('await existingForm.save().catch: ' + e);
                process.exit(1);
            });
        } else {
            const existingFormObj = existingForm.toObject();
            mergeElt(existingFormObj, newFormObj, 'NINDS');
            existingFormObj.changeNote = lastMigrationScript;
            existingFormObj.imported = imported;
            existingFormObj.lastMigrationScript = lastMigrationScript;
            await updateForm(existingFormObj, BATCHLOADER, {updateSource: true});
        }
        delete newFormObj.tinyId;
        delete newFormObj._id;
        newFormObj.attachments = [];
        const updateResult = await FormSource.updateOne({
            tinyId: existingForm.tinyId,
            source: 'NINDS'
        }, newFormObj, {upsert: true});
        printUpdateResult(updateResult, existingForm);
        console.log(`existing form: ${formName} tinyId: ${existingForm.tinyId}`);
    }
}
