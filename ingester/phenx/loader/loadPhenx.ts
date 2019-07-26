import { isEmpty } from 'lodash';
import { Form, FormSource } from 'server/form/mongo-form';
import { Comment } from 'server/discuss/discussDb';
import { ProtocolModel } from 'ingester/createMigrationConnection';
import { createForm } from 'ingester/phenx/Form/form';
import {
    batchloader, BATCHLOADER_USERNAME, compareElt, imported, lastMigrationScript, mergeElt, printUpdateResult,
    updateForm
} from 'ingester/shared/utility';

let protocolCount = 0;

let createdForm = 0;
let createdForms = [];
let sameForm = 0;
let sameForms = [];
let changedForm = 0;
let changedForms = [];
let retiredForm = 0;
let retiredForms = [];

async function retireForms() {
    let cond = {
        'ids.source': 'PhenX',
        lastMigrationScript: {$ne: lastMigrationScript},
        archived: false,
        'updatedBy.username': BATCHLOADER_USERNAME,
    };
    let forms = await Form.find(cond);
    for (let form of forms) {
        let formObj = form.toObject();
        formObj.registrationState.registrationStatus = 'Retired';
        formObj.registrationState.administrativeNote = 'Not present in import at ' + new Date().toJSON();
        await updateForm(formObj, batchloader);
        retiredForm++;
        retiredForms.push(formObj.tinyId);
    }
}

process.on('unhandledRejection', function (error) {
    console.log(error);
});

(function () {
//    let cond = {protocolID: '170101'};
    let cond = {};
    let cursor = ProtocolModel.find(cond).cursor();

    cursor.eachAsync(async (protocol: any) => {
        let protocolObj = protocol.toObject();
        let protocolId = protocolObj.protocolID;
        let newFormObj = await createForm(protocolObj);
        let newForm = new Form(newFormObj);
        newFormObj = newForm.toObject();
        let existingForm = await Form.findOne({archived: false, 'ids.id': protocolId});
        if (!existingForm) {
            existingForm = await newForm.save();
            createdForm++;
            createdForms.push(existingForm.tinyId);
        } else {
            existingForm.imported = imported;
            existingForm.lastMigrationScript = lastMigrationScript;
            existingForm.changeNote = lastMigrationScript;
            let diff = compareElt(newForm.toObject(), existingForm.toObject(), 'PhenX');
            if (isEmpty(diff)) {
                await existingForm.save();
                sameForm++;
                sameForms.push(existingForm.tinyId);
            } else {
                let existingFormObj = existingForm.toObject();
                mergeElt(existingFormObj, newFormObj, 'PhenX');
                await updateForm(existingFormObj, batchloader, {updateSource: true});
                changedForm++;
                changedForms.push(existingForm.tinyId);
            }
        }
        if (newFormObj.registrationState.registrationStatus !== 'Qualified') {
            for (let comment of newFormObj['comments']) {
                comment.element.eltId = existingForm.tinyId;
                await new Comment(comment).save();
            }
        }
        delete newFormObj.tinyId;
        newFormObj.attachments = [];
        let updateResult = await FormSource.updateOne({tinyId: existingForm.tinyId}, newFormObj, {upsert: true});
        printUpdateResult(updateResult, existingForm);
        protocolCount++;
        console.log('protocolCount ' + protocolCount++);
        console.log('Finished protocol: ' + protocolId);
    }).then(async () => {
        console.log('************************************************');
        /*
                        await retireForms();
        */
        console.log('Finished PhenX Loader: ');
        console.log('createdForm: ' + createdForm);
        console.log('createdForms: ' + createdForms);
        console.log('changeForm: ' + changedForm);
        console.log('changeForms: ' + changedForms);
        console.log('sameForm: ' + sameForm);
        console.log('sameForms: ' + sameForms);
        console.log('retiredForm: ' + retiredForm);
        console.log('retiredForms: ' + retiredForms);
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
