import { isEmpty } from 'lodash';
import { dataElementModel } from 'server/cde/mongo-cde';
import {
    BATCHLOADER, compareElt, findOneCde, findOneForm, imported, lastMigrationScript, mergeElt, updateCde, updateForm,
    updateRowArtifact
} from 'ingester/shared/utility';
import { changeNindsPreclinicalNeiClassification } from 'ingester/ninds/csv/shared/utility';
import { formModel } from 'server/form/mongo-form';
import { commentModel } from 'server/discuss/discussDb';

export async function loadNindsCde(nindsCde: any, cond: any, source: string) {
    const newCde = new dataElementModel(nindsCde);
    const newCdeObj = newCde.toObject();
    const existingCdes: any[] = await dataElementModel.find(cond);
    let existingCde: any = findOneCde(existingCdes);
    if (!existingCde) {
        existingCde = await newCde.save().catch((err: any) => {
            console.log(`Not able to save form when save new NINDS cde ${newCde.tinyId} ${err}`);
            process.exit(1);
        });
        console.log(`created cde tinyId: ${existingCde.tinyId}`);
    } else {

        const diff = compareElt(newCde.toObject(), existingCde.toObject(), source);
        changeNindsPreclinicalNeiClassification(existingCde, newCde.toObject(), 'NINDS');

        if (isEmpty(diff)) {
            existingCde.lastMigrationScript = lastMigrationScript;
            existingCde.imported = imported;
            existingCde = await existingCde.save().catch((err: any) => {
                console.log(`Not able to save form when save existing NINDS cde ${existingCde.tinyId} ${err}`);
                process.exit(1);
            });
            console.log(`same cde tinyId: ${existingCde.tinyId}`);
        } else {
            const existingCdeObj = existingCde.toObject();
            mergeElt(existingCdeObj, newCdeObj, source, 'NINDS');
            await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true});
            console.log(`updated cde tinyId: ${existingCde.tinyId}`);
        }
    }
    await updateRowArtifact(existingCde, newCdeObj, source, 'NINDS');

    const savedCde: any = await dataElementModel.findOne(cond);
    return savedCde;
}

export async function loadNindsForm(nindsForm: any, cond: any, source: string) {
    const newForm = new formModel(nindsForm);
    const newFormObj = newForm.toObject();
    const existingForms: any[] = await formModel.find(cond);
    let existingForm: any = findOneForm(existingForms);
    if (!existingForm) {
        existingForm = await newForm.save().catch((err: any) => {
            console.log(`Not able to save form when save new NINDS form ${newForm.tinyId} ${err}`);
            process.exit(1);
        });
        console.log(`created form tinyId: ${existingForm.tinyId}`);
    } else {
        const diff = compareElt(newForm.toObject(), existingForm.toObject(), source);
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
            mergeElt(existingFormObj, newFormObj, source, 'NINDS');
            await updateForm(existingFormObj, BATCHLOADER, {updateSource: true});
            console.log(`change form tinyId: ${existingForm.tinyId}`);
        }
        for (const comment of nindsForm.comments) {
            comment.element.eltId = existingForm.tinyId;
            await new commentModel(comment).save();
        }
        await updateRowArtifact(existingForm, newFormObj, source, 'NINDS');
    }
    const savedForm: any = await formModel.findOne(cond);
    return savedForm;
}
