import {isEmpty} from 'lodash';
import {createPhenxForm} from 'ingester/phenx/Form/form';
import {formModel} from 'server/form/mongo-form';
import {PhenxLogger} from 'ingester/log/PhenxLogger';
import {
    BATCHLOADER,
    compareElt,
    imported,
    lastMigrationScript,
    mergeClassification,
    mergeElt,
    updateForm,
    updateRawArtifact
} from 'ingester/shared/utility';

let protocolCount = 0;

export async function loadPhenxById(phenxId: string) {
    const protocol: any = await PROTOCOL.findOne({protocolID: phenxId}).lean();
    const protocolId = protocol.protocolID;
    console.log('Start protocol: ' + protocolId);
    let existingForm: any = await formModel.findOne({archived: false, 'ids.id': protocolId});
    const isExistingFormQualified = existingForm && existingForm.registrationState.registrationStatus === 'Qualified';
    const phenxForm: any = await createPhenxForm(protocol, isExistingFormQualified, 'Qualified');

    /*
        const emptyCsvCommentText = 'PhenX Batch loader was not able to find instrument.csv';
        const emptyCsvComments = phenxForm.comments.filter(c => c.text.indexOf(emptyCsvCommentText) > -1);
        const hasEmptyCsvComments = emptyCsvComments.length > 0;
    */

    const newForm = new formModel(phenxForm);
    const newFormObj = newForm.toObject();

    if (isEmpty(newForm.formElements)) {
        console.log(`Skip empty question form: ${phenxId}`);
    } else {
        if (!existingForm) {
            existingForm = await newForm.save();
            PhenxLogger.createdPhenxForm++;
            PhenxLogger.createdPhenxForms.push(existingForm.tinyId + `[${protocolId}]`);
        } else {
            const diff = compareElt(newForm.toObject(), existingForm.toObject(), 'PhenX');
            mergeClassification(existingForm, newForm.toObject(), 'PhenX');
            if (isEmpty(diff)) {
                existingForm.lastMigrationScript = lastMigrationScript;
                existingForm.imported = imported;
                await existingForm.save();
                PhenxLogger.samePhenxForm++;
                PhenxLogger.samePhenxForms.push(existingForm.tinyId);
            } else {
                const existingFormObj = existingForm.toObject();
                mergeElt(existingFormObj, newFormObj, 'PhenX');
                await updateForm(existingFormObj, BATCHLOADER, {updateSource: true});
                PhenxLogger.changedPhenxForm++;
                PhenxLogger.changedPhenxForms.push(existingForm.tinyId);
            }
        }
        if (newFormObj.registrationState.registrationStatus !== 'Qualified') {
            for (const comment of phenxForm.comments) {
                comment.element.eltId = existingForm.tinyId;
                await new commentModel(comment).save();
            }
        }
        await updateRawArtifact(existingForm, newFormObj, 'PhenX', 'PhenX');
        protocolCount++;
        console.log('protocolCount ' + protocolCount);
        console.log('Finished protocol: ' + protocolId);
    }
}
