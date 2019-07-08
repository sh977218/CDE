import { isEmpty } from 'lodash';
import { Form, FormSource } from '../../../server/form/mongo-form';
import { Comment } from '../../../server/discuss/discussDb';
import { batchloader } from '../../shared/updatedByLoader';
import { ProtocolModel } from '../../createMigrationConnection';
import { compareForm, createForm, mergeForm } from '../Form/form';
import { printUpdateResult, updateForm } from '../../shared/utility';

let protocolCount = 0;
let createdForm = 0;
let sameForm = 0;
let changeForm = 0;
let retiredForm = 0;

async function retireForms() {
    let cond = {
        'ids.source': "PhenX",
        archived: false,
        'registrationState.registrationStatus': {$ne: "Retired"},
        imported: {$lt: new Date().setHours(new Date().getHours() - 8)},
        $or: [
            {"updatedBy.username": "batchloader"},
            {
                $and: [
                    {"updatedBy.username": {$exists: false}},
                    {"createdBy.username": {$exists: true}}
                ]
            }
        ]
    };
    let forms = await Form.find(cond);
    for (let form of forms) {
        form.registrationState.registrationStatus = 'Retired';
        form.registrationState.administrativeNote = 'Not present in import at ' + new Date().toJSON();
        form.markModified('registrationState');
        let formObj = form.toObject();
        await form.save().catch(e => {
            throw `Error await form.save(): ${formObj.tinyId} ${e}`;
        });
        retiredForm++;
    }
}

process.on('unhandledRejection', function (error) {
    console.log(error);
});


(function () {
    let cond = {};
//   let cond = {protocolID: '661501'};
    ProtocolModel.find(cond)
        .cursor({batchSize: 1, useMongooseAggCursor: true})
        .eachAsync(async (protocol: any) => {
            let protocolObj = protocol.toObject();
            protocolCount++;
            let protocolId = protocolObj.protocolID;
            console.log('Starting protocol: ' + protocolId);
            protocolCount++;
            let newFormObj = await createForm(protocolObj);
            let newForm = new Form(newFormObj);
            let existingForm = await Form.findOne({
                archived: false,
                'registrationState.registrationStatus': {$ne: 'Retired'},
                'ids.id': protocolId
            }).catch(e => {
                throw "Error await Form.findOne({: " + e;
            });
            if (!existingForm) {
                existingForm = await newForm.save().catch(e => {
                    throw "Error await newForm.save(): " + protocolId + e;
                });
                createdForm++;
                console.log('createdForm: ' + createdForm);
            } else {
                existingForm.imported = new Date().toJSON();
                let diff = compareForm(newForm, existingForm);
                if (isEmpty(diff)) {
                    await existingForm.save().catch(e => {
                        throw "Error await existingForm.save(): " + e;
                    });
                    sameForm++;
                    console.log('sameForm: ' + sameForm);
                } else {
                    await mergeForm(existingForm, newForm).catch(e => {
                        throw "Error await MergeForm.mergeForm(existingForm, newForm): " + e;
                    });
                    existingForm.changeNote = '';
                    await updateForm(existingForm, batchloader, {updateSource: true}).catch(e => {
                        throw "Error await mongo_form.updatePromise(existingForm, batchloader): " + e;
                    });
                    changeForm++;
                    console.log('changeForm: ' + changeForm);
                }
            }
            for (let comment of newFormObj['comments']) {
                comment.eltTinyId = existingForm.tinyId;
                await new Comment(comment).save().catch(e => {
                    throw "Error await comment.save(): " + e;
                });
            }
            delete newFormObj['tinyId'];
            let updateResult = await FormSource.updateOne({tinyId: existingForm.tinyId}, newFormObj, {upsert: true}).catch(e => {
                throw'Error await FormSource.updateOne({tinyId: existingForm.tinyId}: ' + e;
            });

            printUpdateResult(updateResult, 'form');

            console.log('Finished protocol: ' + protocolId);
        }).then(async () => {
        console.log('************************************************');
        retireForms().catch(e => {
            throw "Error await retireForms(): " + e;
        });

        console.log('Finished PhenX Loader: ');
        console.log('createdForm: ' + createdForm);
        console.log('changeForm: ' + changeForm);
        console.log('sameForm: ' + sameForm);
        console.log('retiredForm: ' + retiredForm);
    }, error => console.log(error));
})();
