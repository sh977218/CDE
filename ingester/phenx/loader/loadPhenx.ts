import { isEmpty } from 'lodash';
import { Form, FormSource } from 'server/form/mongo-form';
import { Comment } from 'server/discuss/discussDb';
import { ProtocolModel } from 'ingester/createMigrationConnection';
import {
    BATCHLOADER, compareElt, imported, lastMigrationScript, mergeElt, printUpdateResult, sourceMap, updateCde,
    updateForm
} from 'ingester/shared/utility';
import { createPhenxForm } from 'ingester/phenx/Form/form';

import { PhenxLogger } from 'ingester/log/PhenxLogger';
import { LoincLogger } from 'ingester/log/LoincLogger';
import { RedcapLogger } from 'ingester/log/RedcapLogger';
import { DataElement } from 'server/cde/mongo-cde';

let protocolCount = 0;

const phenxSources = sourceMap.PhenX;

function retireForms() {
    return new Promise(resolve => {
        const cond = {
            'ids.source': {$in: phenxSources},
            'registrationState.registrationStatus': {$ne: 'Retired'},
            archived: false
        };
        Form.find(cond).cursor({batchSize: 10})
            .eachAsync(async form => {
                const formObj = form.toObject();
                if (formObj.lastMigrationScript !== lastMigrationScript) {
                    formObj.registrationState.registrationStatus = 'Retired';
                    formObj.registrationState.administrativeNote = 'Not present in import at ' + imported;
                    await updateForm(formObj, BATCHLOADER);
                    PhenxLogger.retiredPhenxForm++;
                    PhenxLogger.retiredPhenxForms.push(formObj.tinyId);
                }
            }).then(resolve);
    });
}

async function retireCdes() {
    return new Promise(resolve => {
        const cond = {
            'ids.source': {$in: phenxSources},
            'registrationState.registrationStatus': {$ne: 'Retired'},
            archived: false,
            lastMigrationScript: {$ne: lastMigrationScript}
        };
        DataElement.find(cond).cursor({batchSize: 10})
            .eachAsync(async cde => {
                const cdeObj = cde.toObject();
                if (cdeObj.lastMigrationScript !== lastMigrationScript) {
                    cdeObj.registrationState.registrationStatus = 'Retired';
                    cdeObj.registrationState.administrativeNote = 'Not present in import at ' + imported;
                    await updateCde(cdeObj, BATCHLOADER);
                    PhenxLogger.retiredPhenxCde++;
                    PhenxLogger.retiredPhenxCdes.push(cdeObj.tinyId);
                }
            }).then(resolve);
    });
}

process.on('unhandledRejection', error => {
    console.log(error);
});

(() => {
//    const cond = {protocolID: {$in: ['21302']}};
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
            const diff = compareElt(newForm.toObject(), existingForm.toObject());
            if (isEmpty(diff)) {
                existingForm.imported = imported;
                existingForm.lastMigrationScript = lastMigrationScript;
                await existingForm.save();
                PhenxLogger.samePhenxForm++;
                PhenxLogger.samePhenxForms.push(existingForm.tinyId);
            } else {
                const existingFormObj = existingForm.toObject();
                mergeElt(existingFormObj, newFormObj, 'PhenX');
                existingFormObj.changeNote = lastMigrationScript;
                existingFormObj.lastMigrationScript = lastMigrationScript;
                await updateForm(existingFormObj, BATCHLOADER, {updateSource: true});
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
        const updateResult = await FormSource.updateOne({
            tinyId: existingForm.tinyId,
            source: 'PhenX'
        }, newFormObj, {upsert: true});
        printUpdateResult(updateResult, existingForm);
        protocolCount++;
        console.log('protocolCount ' + protocolCount);
        console.log('Finished protocol: ' + protocolId);
    }).then(async () => {
        console.log('Retiring cdes.');
        await retireCdes();
        console.log('Retiring forms.');
        await retireForms();
        PhenxLogger.log();
        LoincLogger.log();
        RedcapLogger.log();
        console.log('Finished PhenX Loader: ');
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
