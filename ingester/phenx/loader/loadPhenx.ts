import { isEmpty } from 'lodash';
import { Form, FormSource } from 'server/form/mongo-form';
import { Comment } from 'server/discuss/discussDb';
import { ProtocolModel } from 'ingester/createMigrationConnection';
import {
    batchloader, compareElt, imported, lastMigrationScript, mergeElt, printUpdateResult, updateCde, updateForm
} from 'ingester/shared/utility';
import { DataElement } from 'server/cde/mongo-cde';
import { createPhenxForm } from 'ingester/phenx/Form/form';

import { PhenxLogger } from 'ingester/log/PhenxLogger';

let protocolCount = 0;

async function retireForms() {
    const cond = {
        'ids.source': 'PhenX',
        lastMigrationScript: {$ne: lastMigrationScript},
        archived: false
    };
    const forms = await Form.find(cond);
    for (const form of forms) {
        const formObj = form.toObject();
        formObj.registrationState.registrationStatus = 'Retired';
        formObj.registrationState.administrativeNote = 'Not present in import at ' + imported;
        await updateForm(formObj, batchloader);
        PhenxLogger.retiredPhenxForm++;
        PhenxLogger.retiredPhenxForms.push(formObj.tinyId);
    }
}

async function retireCdes() {
    const cond = {
        'ids.source': 'PhenX',
        lastMigrationScript: {$ne: lastMigrationScript},
        archived: false
    };
    const cdes = await DataElement.find(cond);
    for (const cde of cdes) {
        const cdeObj = cde.toObject();
        cdeObj.registrationState.registrationStatus = 'Retired';
        cdeObj.registrationState.administrativeNote = 'Not present in import at ' + imported;
        await updateCde(cdeObj, batchloader);
        PhenxLogger.retiredPhenxCde++;
        PhenxLogger.retiredPhenxCdes.push(cdeObj.tinyId);
    }
}

process.on('unhandledRejection', error => {
    console.log(error);
});

(() => {
//    let cond = {protocolID: '170101'};
    const cond = {};
    const cursor = ProtocolModel.find(cond).cursor({batchSize: 10});

    cursor.eachAsync(async (protocol: any) => {
        const protocolObj = protocol.toObject();
        const protocolId = protocolObj.protocolID;
        const phenxForm = await createPhenxForm(protocolObj);
        const newForm = new Form(phenxForm);
        const newFormObj = newForm.toObject();
        let existingForm = await Form.findOne({archived: false, 'ids.id': protocolId});
        if (!existingForm) {
            existingForm = await newForm.save();
            PhenxLogger.createdPhenxForm++;
            PhenxLogger.createdPhenxForms.push(existingForm.tinyId);
        } else {
            const existingFormObj = existingForm.toObject();
            existingFormObj.imported = imported;
            existingFormObj.changeNote = lastMigrationScript;
            const diff = compareElt(newForm.toObject(), existingForm.toObject(), 'PhenX');
            if (isEmpty(diff)) {
                existingFormObj.lastMigrationScript = lastMigrationScript;
                await existingForm.save();
                PhenxLogger.samePhenxForm++;
                PhenxLogger.samePhenxForms.push(existingForm.tinyId);
            } else {
                mergeElt(existingFormObj, newFormObj, 'PhenX');
                existingFormObj.lastMigrationScript = lastMigrationScript;
                await updateForm(existingFormObj, batchloader, {updateSource: true});
                PhenxLogger.changedPhenxForm++;
                PhenxLogger.changedPhenxForms.push(existingForm.tinyId);
            }
        }
        if (newFormObj.registrationState.registrationStatus !== 'Qualified') {
            for (const comment of phenxForm.comments) {
                comment.element.eltId = existingForm.tinyId;
                await new Comment(comment).save();
            }
        }
        delete newFormObj.tinyId;
        delete newFormObj._id;
        newFormObj.attachments = [];
        const updateResult = await FormSource.updateOne({tinyId: existingForm.tinyId}, newFormObj, {upsert: true});
        printUpdateResult(updateResult, existingForm);
        protocolCount++;
        console.log('protocolCount ' + protocolCount);
        console.log('Finished protocol: ' + protocolId);
    }).then(async () => {
        console.log('************************************************');
        await retireForms();
        await retireCdes();
        console.log('Finished PhenX Loader: ');
        PhenxLogger.log();
        process.exit(0);
    }, error => {
        if (error) {
            console.log(error);
            process.exit(1);
        } else {
            process.exit(0);
        }
    });
})();
