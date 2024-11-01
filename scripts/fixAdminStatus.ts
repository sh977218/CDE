import 'server/globals';
import { Model } from 'mongoose';
import {
    dataElementDraftModel,
    dataElementModel,
    dataElementSourceModel
} from 'server/mongo/mongoose/dataElement.mongoose';
import { formDraftModel, formModel, formSourceModel } from 'server/mongo/mongoose/form.mongoose';
import { Elt } from 'shared/models.model';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

async function doOneCollection(collection: Model<Elt>) {
    const cond = {archived: false};
    const cursor = collection.find(cond).cursor();
    return cursor.eachAsync(async (model) => {
        const modelObj = model.toObject();
        console.log(`start ${modelObj.tinyId}  .`);
        const registrationStatus = modelObj.registrationState.registrationStatus;
        if (registrationStatus) {
            if (['Qualified', 'Standard', 'Preferred'].indexOf(registrationStatus) !== -1) {
                model.registrationState.administrativeStatus = 'Published';
            } else if (['Incomplete', 'Candidate', 'Recorded'].indexOf(registrationStatus) !== -1) {
                model.registrationState.administrativeStatus = 'NLM Review';
            } else if (registrationStatus === 'Retired') {
                model.registrationState.administrativeStatus = 'Retired';
            } else {
                console.log(`${modelObj.tinyId} has unknown registrationStatus ${registrationStatus}`);
                process.exit(1);
            }
        } else {
            console.log(`${modelObj.tinyId} has no registrationStatus ${registrationStatus}`);
            process.exit(1);
        }
        await model.save();
        console.log(`${modelObj.tinyId} fixed.`);
    });
}

function run() {
    const tasks = [dataElementModel, dataElementDraftModel, dataElementSourceModel,
        formModel, formDraftModel, formSourceModel]
        .map((model: any) => doOneCollection(model));
    Promise.all(tasks).then(() => {
        console.log('done');
        process.exit(0);
    }, err => {
        console.log('err ' + err);
        process.exit(1);
    });
}

run();
