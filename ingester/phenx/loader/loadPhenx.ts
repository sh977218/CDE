import { isEmpty } from 'lodash';
import { Form, FormSource } from 'server/form/mongo-form';
import { Comment } from 'server/discuss/discussDb';
import { ProtocolModel } from 'ingester/createMigrationConnection';
import { createForm, mergeForm } from 'ingester/phenx/Form/form';
import { BATCHLOADER_USERNAME, batchloader, compareElt, printUpdateResult, updateForm } from 'ingester/shared/utility';

let protocolCount = 0;

let createdForm = 0;
let sameForm = 0;
let changeForm = 0;
let retiredForm = 0;

async function retireForms() {
    let cond = {
        'ids.source': 'PhenX',
        lastMigrationScript: {$ne: 'loadPhenXJuly2019'},
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
    }
}

process.on('unhandledRejection', function (error) {
    console.log(error);
});

(function () {
    let cond = {};

    let cursor = ProtocolModel.find(cond).cursor();

    cursor.eachAsync(async (protocol: any) => {
        let protocolObj = protocol.toObject();
        protocolCount++;
        let protocolId = protocolObj.protocolID;
        console.log('Starting protocol: ' + protocolId);
        let newFormObj = await createForm(protocolObj);
        let newForm = new Form(newFormObj);
        let existingForm = await Form.findOne({archived: false, 'ids.id': protocolId}).catch(e => {
            throw 'Error await Form.findOne({: ' + e;
        });
        if (!existingForm) {
            existingForm = await newForm.save().catch(e => {
                throw 'Error await newForm.save(): ' + protocolId + e;
            });
            createdForm++;
            console.log('createdForm: ' + createdForm);
        } else {
            existingForm.imported = new Date().toJSON();
            existingForm.lastMigrationScript = 'loadPhenXJuly2019';
            let diff = compareElt(newForm.toObject(), existingForm.toObject());
            if (isEmpty(diff)) {
                await existingForm.save().catch(e => {
                    throw 'Error await existingForm.save(): ' + e;
                });
                sameForm++;
                console.log('sameForm: ' + sameForm);
            } else {
                mergeForm(existingForm, newForm);
                existingForm.changeNote = '';
                await updateForm(existingForm, batchloader, {updateSource: true}).catch(e => {
                    throw 'Error await updateForm(existingForm, batchloader): ' + e;
                });
                changeForm++;
                console.log('changeForm: ' + changeForm);
            }
        }
        if (newFormObj.registrationState.registrationStatus !== 'Qualified') {
            for (let comment of newFormObj['comments']) {
                comment.element.eltId = existingForm.tinyId;
                await new Comment(comment).save().catch(e => {
                    throw 'Error await comment.save(): ' + e;
                });
            }
        }
        delete newFormObj['tinyId'];
        let updateResult = await FormSource.updateOne({tinyId: existingForm.tinyId}, newFormObj, {upsert: true}).catch(e => {
            throw'Error await FormSource.updateOne({tinyId: existingForm.tinyId}: ' + e;
        });

        printUpdateResult(updateResult, existingForm);
        console.log('Finished protocol: ' + protocolId);
    }).then(async () => {
        console.log('************************************************');
        /*
                await retireForms().catch(e => {
                    throw "Error await retireForms(): " + e;
                });
        */
        console.log('Finished PhenX Loader: ');
        console.log('createdForm: ' + createdForm);
        console.log('changeForm: ' + changeForm);
        console.log('sameForm: ' + sameForm);
        console.log('retiredForm: ' + retiredForm);
    }, error => console.log(error));
})();
