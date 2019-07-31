import { isEmpty } from 'lodash';
import { Form, FormSource } from 'server/form/mongo-form';
import { Comment } from 'server/discuss/discussDb';
import { ProtocolModel } from 'ingester/createMigrationConnection';
import { createPhenxForm } from 'ingester/phenx/Form/form';
import {
    batchloader, compareElt, imported, lastMigrationScript, mergeElt, printUpdateResult, updateCde, updateForm
} from 'ingester/shared/utility';
import { DataElement } from 'server/cde/mongo-cde';

let protocolCount = 0;

let createdForm = 0;
const createdForms = [];
let sameForm = 0;
const sameForms = [];
let changedForm = 0;
const changedForms = [];
let retiredForm = 0;
const retiredForms = [];
let retiredCde = 0;
const retiredCdes = [];

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
        formObj.registrationState.administrativeNote = 'Not present in import at ' + new Date().toJSON();
        await updateForm(formObj, batchloader);
        retiredForm++;
        retiredForms.push(formObj.tinyId);
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
        cdeObj.registrationState.administrativeNote = 'Not present in import at ' + new Date().toJSON();
        await updateCde(cdeObj, batchloader);
        retiredCde++;
        retiredCdes.push(cdeObj.tinyId);
    }
}

process.on('unhandledRejection', error => {
    console.log(error);
});

(() => {
//    let cond = {protocolID: '170101'};
    const cond = {};
    const cursor = ProtocolModel.find(cond).cursor({batchSize: 1});

    cursor.eachAsync(async (protocol: any) => {
        const protocolObj = protocol.toObject();
        const protocolId = protocolObj.protocolID;
        const phenxForm = await createPhenxForm(protocolObj);
        const newForm = new Form(phenxForm);
        const newFormObj = newForm.toObject();
        let existingForm = await Form.findOne({archived: false, 'ids.id': protocolId});
        if (!existingForm) {
            existingForm = await newForm.save();
            createdForm++;
            createdForms.push(existingForm.tinyId);
        } else {
            const existingFormObj = existingForm.toObject();
            existingFormObj.imported = imported;
            existingFormObj.lastMigrationScript = lastMigrationScript;
            existingFormObj.changeNote = lastMigrationScript;
            const diff = compareElt(newForm.toObject(), existingForm.toObject(), 'PhenX');
            if (isEmpty(diff)) {
                await existingForm.save();
                sameForm++;
                sameForms.push(existingForm.tinyId);
            } else {
                mergeElt(existingFormObj, newFormObj, 'PhenX');
                await updateForm(existingFormObj, batchloader, {updateSource: true});
                changedForm++;
                changedForms.push(existingForm.tinyId);
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
        console.log('protocolCount ' + protocolCount++);
        console.log('Finished protocol: ' + protocolId);
    }).then(async () => {
        console.log('************************************************');

        await retireForms();
        await retireCdes();
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
