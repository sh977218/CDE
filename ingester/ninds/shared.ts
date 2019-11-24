import { isEmpty } from 'lodash';
import { dataElementModel } from 'server/cde/mongo-cde';
import {
    BATCHLOADER, compareElt, findOneCde, findOneForm, fixCde, fixForm, imported, lastMigrationScript, mergeElt,
    updateCde, updateForm, updateRowArtifact
} from 'ingester/shared/utility';
import { formModel } from 'server/form/mongo-form';
import { commentModel } from 'server/discuss/discussDb';

export function doNindsClassification(existingCde: any, newCdeObj: any) {
    const nindsClassifications = existingCde.classification.filter((c: any) => c.stewardOrg.name === 'NINDS');
    if (nindsClassifications.length === 1) {
        const nindsClassification = nindsClassifications[0];
        const preclinicalClassifications = nindsClassification.elements.filter((e: any) => e.name === 'Preclinical TBI');
        if (preclinicalClassifications.length === 1) {
            newCdeObj.classification.forEach((c: any) => {
                c.elements = preclinicalClassifications.concat(c.elements);
            });
        }
    }
    const otherClassifications = existingCde.classification.filter((c: any) => c.stewardOrg.name !== 'NINDS');
    existingCde.classification = newCdeObj.classification.concat(otherClassifications);
}

export async function loadNindsCde(nindsCde: any, cond: any, source: string) {
    const newCde = new dataElementModel(nindsCde);
    const newCdeObj = newCde.toObject();
    const existingCdes: any[] = await dataElementModel.find(cond);
    let existingCde: any = findOneCde(existingCdes);
    if (!existingCde) {
        existingCde = await newCde.save().catch((err: any) => {
            console.log(`Not able to save cde when save new NINDS cde ${newCde.tinyId} ${err}`);
            process.exit(1);
        });
        console.log(`created cde tinyId: ${existingCde.tinyId}`);
    } else {
        // @TODO fix any issue on existing cde.
        existingCde = await fixCde(existingCde);
        const diff = compareElt(newCde.toObject(), existingCde.toObject(), source);
        if (isEmpty(diff)) {
            existingCde.lastMigrationScript = lastMigrationScript;
            existingCde.imported = imported;
            doNindsClassification(existingCde, newCde.toObject());
            existingCde = await existingCde.save().catch((err: any) => {
                console.log(`Not able to save cde when save existing NINDS cde ${existingCde.tinyId} ${err}`);
                process.exit(1);
            });
            console.log(`same cde tinyId: ${existingCde.tinyId}`);
        } else {
            const existingCdeObj = existingCde.toObject();
            doNindsClassification(existingCdeObj, newCde.toObject());
            mergeElt(existingCdeObj, newCdeObj, source);
            await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true}).catch((err: any) => {
                console.log(`Not able to update cde when update existing NINDS cde ${existingCde.tinyId} ${err}`);
                process.exit(1);
            });
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
        // @TODO fix any issue on existing form.
        existingForm = await fixForm(existingForm).catch((err: any) => {
            console.log(`Not able to fix form when in loadNindsForm ${err}`);
            process.exit(1);
        });

        const diff = compareElt(newForm.toObject(), existingForm.toObject(), source);
        if (isEmpty(diff)) {
            existingForm.lastMigrationScript = lastMigrationScript;
            existingForm.imported = imported;
            doNindsClassification(existingForm, newForm.toObject());
            await existingForm.save().catch((err: any) => {
                console.log(`Not able to save form when save existing NINDS form ${existingForm.tinyId} ${err}`);
                process.exit(1);
            });
            console.log(`same form tinyId: ${existingForm.tinyId}`);
        } else {
            const existingFormObj = existingForm.toObject();
            doNindsClassification(existingFormObj, newForm.toObject());
            mergeElt(existingFormObj, newFormObj, source);
            await updateForm(existingFormObj, BATCHLOADER, {updateSource: true}).catch((err: any) => {
                console.log(`Not able to update form when update existing NINDS form ${existingFormObj.tinyId} ${err}`);
                process.exit(1);
            });
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
