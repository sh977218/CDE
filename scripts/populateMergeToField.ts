import 'server/globals';
import { dataElementModel } from 'server/cde/mongo-cde';
import { CdeFormDocument, formModel, formSourceModel } from 'server/form/mongo-form';
import { Model } from 'mongoose';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

const cond = {
    changeNote: /Merge to tinyId/,
    'registrationState.registrationStatus': 'Retired',
    archived: false
};

async function doOneCollection (model: Model<CdeFormDocument>){
    const cursor = await model.find(cond).cursor();
    return cursor.eachAsync(async model => {
        const mergedToTinyId = model.changeNote?.split(' ').at(-1) || '';

        if (mergedToTinyId) {
            model.registrationState.mergedTo = { tinyId: mergedToTinyId };
            model.registrationState.administrativeNote = `Merged to tinyId: ${mergedToTinyId}`

            await model.save();

            console.log(`${model.tinyId} updated.`);
        }
    });
}

async function run(){
    const tasks = [formModel, dataElementModel]
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
