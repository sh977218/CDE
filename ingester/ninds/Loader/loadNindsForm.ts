import { isEmpty, words } from 'lodash';
import { createNindsForm } from 'ingester/ninds/csv/form';
import { BATCHLOADER, compareElt, imported, lastMigrationScript, mergeElt, updateForm } from 'ingester/shared/utility';
import { Form } from 'server/form/mongo-form';

function convertFileNameToFormName(fullFileName) {
    const trimmedFileName = fullFileName
        .replace('.csv', '')
        .replace('.xlsx').trim();
    const terms = words(trimmedFileName);
    return terms.filter(t => !isEmpty(t) && isNaN(t)).join(' ');
}

export async function loadFormByCsv({rows, csvFileName}) {
    const formName = convertFileNameToFormName(csvFileName);
    const nindsForm = await createNindsForm(formName, rows);
    const newForm = new Form(nindsForm);
    const newFormObj = newForm.toObject();
    let existingForm = await Form.findOne({archived: false, 'designations.designation': formName});
    if (!existingForm) {
        existingForm = await newForm.save().catch(e => {
            console.log('await newForm.save().catch: ' + e);
            process.exit(1);
        });
        console.log(`created form: ${formName} tinyId: ${existingForm.tinyId}`);
    } else {
        const diff = compareElt(newForm.toObject(), existingForm.toObject(), 'NINDS');
        if (isEmpty(diff)) {
            existingForm.imported = imported;
            existingForm.lastMigrationScript = lastMigrationScript;
            await existingForm.save().catch(e => {
                console.log('await existingForm.save().catch: ' + e);
                process.exit(1);
            });
        } else {
            const existingFormObj = existingForm.toObject();
            existingFormObj.changeNote = lastMigrationScript;
            mergeElt(existingFormObj, newFormObj, 'NINDS');
            existingFormObj.lastMigrationScript = lastMigrationScript;
            await updateForm(existingFormObj, BATCHLOADER, {updateSource: true});
        }
        console.log(`existing form: ${formName} tinyId: ${existingForm.tinyId}`);
    }
}
