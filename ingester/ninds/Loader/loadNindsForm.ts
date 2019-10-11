import { isEmpty, words, replace, filter, join, isEqual, trim } from 'lodash';
import {
    BATCHLOADER, compareElt, imported, lastMigrationScript, mergeElt, updateForm, updateRowArtifact
} from 'ingester/shared/utility';
import { formModel } from 'server/form/mongo-form';
import { createNindsForm } from 'ingester/ninds/csv/form/form';
import { commentModel } from 'server/discuss/discussDb';

function convertFileNameToFormName(csvFileName: string) {
    const replaceCsvFileName = replace(csvFileName, '.csv', '');
    const wordsCsvFileName = words(replaceCsvFileName);
    const filterCsvFileName = filter(wordsCsvFileName, o => !isEqual(o, 'C'));
    const joinCsvFileName = join(filterCsvFileName, ' ');
    return trim(joinCsvFileName);
}

export async function loadFormByCsv({rows, csvFileName}: any) {
    const formName = convertFileNameToFormName(csvFileName);
    const nindsForm = await createNindsForm(formName, rows);
    const newForm = new formModel(nindsForm);
    const newFormObj = newForm.toObject();
    let existingForm: any = await formModel.findOne({archived: false, 'designations.designation': formName});
    if (!existingForm) {
        existingForm = await newForm.save().catch((e: any) => {
            console.log('await newForm.save().catch: ' + e);
            process.exit(1);
        });
        console.log(`created form: ${formName} tinyId: ${existingForm.tinyId}`);
    } else {
        const diff = compareElt(newForm.toObject(), existingForm.toObject(), 'NINDS');
        if (isEmpty(diff)) {
            existingForm.imported = imported;
            existingForm.lastMigrationScript = lastMigrationScript;
            await existingForm.save().catch((e: any) => {
                console.log('await existingForm.save().catch: ' + e);
                process.exit(1);
            });
        } else {
            const existingFormObj = existingForm.toObject();
            mergeElt(existingFormObj, newFormObj, 'NINDS', 'NINDS');
            existingFormObj.changeNote = lastMigrationScript;
            existingFormObj.imported = imported;
            existingFormObj.lastMigrationScript = lastMigrationScript;
            await updateForm(existingFormObj, BATCHLOADER, {updateSource: true});
        }
        for (const comment of nindsForm.comments) {
            comment.element.eltId = existingForm.tinyId;
            await new commentModel(comment).save();
        }
        await updateRowArtifact(existingForm, newFormObj, 'NINDS', 'NINDS');
        console.log(`existing form: ${formName} tinyId: ${existingForm.tinyId}`);
    }
}
