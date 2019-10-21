import { isEmpty, words, forEach, replace, filter, join, isEqual, trim } from 'lodash';
import {
    BATCHLOADER, compareElt, imported, lastMigrationScript, loopFormElements, mergeClassification,
    mergeClassificationByOrg, mergeElt,
    updateForm, updateRowArtifact
} from 'ingester/shared/utility';
import { formModel } from 'server/form/mongo-form';
import { createNindsForm } from 'ingester/ninds/csv/form/form';
import { commentModel } from 'server/discuss/discussDb';
import {
    changeNindsPreclinicalNeiClassification, fixDefinitions, fixFormElements, fixReferenceDocuments,
    removePreclinicalClassification
} from 'ingester/ninds/csv/shared/utility';

function convertFileNameToFormName(csvFileName: string) {
    const replaceCsvFileName = replace(csvFileName, '.csv', '');
    const wordsCsvFileName = words(replaceCsvFileName);
    const filterCsvFileName = filter(wordsCsvFileName, o => {
        const isC = isEqual(o, 'C');
        const oNumber = Number(o);
        const isNotNumber = isNaN(oNumber);
        return !isC && isNotNumber;
    });
    const joinCsvFileName = join(filterCsvFileName, ' ');
    return trim(joinCsvFileName);
}

async function fixForm(existingForm: any) {
    fixDefinitions(existingForm);
    fixReferenceDocuments(existingForm);
    fixFormElements(existingForm);

    const savedForm = await existingForm.save().catch((err: any) => {
        console.log(`Not able to save form when fixForm ${existingForm.tinyId} ${err}`);
        process.exit(1);
    });
    return savedForm;
}

export async function loadFormByCsv({rows, csvFileName}: any) {
    const formName = convertFileNameToFormName(csvFileName);
    const nindsForm = await createNindsForm(formName, csvFileName, rows);
    const newForm = new formModel(nindsForm);
    const newFormObj = newForm.toObject();
    let existingForm: any = await formModel.findOne({archived: false, 'designations.designation': formName});
    if (!existingForm) {
        existingForm = await newForm.save().catch((err: any) => {
            console.log(`Not able to save form when save new NINDS form ${newForm.tinyId} ${err}`);
            process.exit(1);
        });
        console.log(`created form: ${formName} tinyId: ${existingForm.tinyId}`);
    } else {
        // @TODO remove after load
        existingForm = await fixForm(existingForm);

        const diff = compareElt(newForm.toObject(), existingForm.toObject(), 'NINDS');
        changeNindsPreclinicalNeiClassification(existingForm, newForm.toObject(), 'NINDS');

        if (isEmpty(diff)) {
            existingForm.lastMigrationScript = lastMigrationScript;
            existingForm.imported = imported;
            await existingForm.save().catch((err: any) => {
                console.log(`Not able to save form when save existing NINDS form ${existingForm.tinyId} ${err}`);
                process.exit(1);
            });
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
        await updateRowArtifact(existingForm, newFormObj, 'NINDS Preclinical NEI', 'NINDS');
    }
}
