import { isEmpty, words, replace, filter, join, isEqual, trim } from 'lodash';
import {
    BATCHLOADER, compareElt, imported, lastMigrationScript, mergeClassification, mergeElt, updateForm, updateRowArtifact
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
        existingForm = await newForm.save();
        console.log(`created form: ${formName} tinyId: ${existingForm.tinyId}`);
    } else {
        const diff = compareElt(newForm.toObject(), existingForm.toObject(), 'NINDS');
        mergeClassification(existingForm, newForm.toObject(), 'NINDS');
        if (isEmpty(diff)) {
            existingForm.lastMigrationScript = lastMigrationScript;
            existingForm.imported = imported;
            await existingForm.save();
            console.log(`same form tinyId: ${existingForm.tinyId}`);
        } else {
            const existingFormObj = existingForm.toObject();
            mergeElt(existingFormObj, newFormObj, 'NINDS', 'NINDS');
            await updateForm(existingFormObj, BATCHLOADER, {updateSource: true});
            console.log(`change form tinyId: ${existingForm.tinyId}`);
        }
        for (const comment of nindsForm.comments) {
            comment.element.eltId = existingForm.tinyId;
            await new commentModel(comment).save();
        }
        await updateRowArtifact(existingForm, newFormObj, 'NINDS', 'NINDS');
    }
}
