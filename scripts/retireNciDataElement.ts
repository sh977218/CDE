import 'server/globals';
import { Model } from 'mongoose';
import { DataElementDocument, dataElementModel } from 'server/cde/mongo-cde';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

let deCounter = 0;

async function doOneCollection(collection: Model<DataElementDocument>) {
    const cond = {
        archived: false,
        'classification.stewardOrg.name': 'NCI',
        'registrationState.registrationStatus': {$ne: 'Retired'},
    };
    const cursor = collection.find(cond).cursor();
    return cursor.eachAsync(async model => {
        model.classification = model.classification.filter(c => c.stewardOrg.name !== 'NCI');
        if (model.classification.length === 0) {
            model.registrationState.registrationStatus = 'Retired';
        }
        await model.save().catch(e => {
            console.log(`${model.tinyId} has error. ${e}`);
            process.exit(1);
        });
        deCounter++;
        return;
    });
}

function run() {
    const tasks = [dataElementModel]
        .map(model => doOneCollection(model));
    Promise.all(tasks).then(() => {
        console.log('done');
        console.log(`deCounter: ${deCounter}`)
        process.exit(0);
    }, err => {
        console.log('err ' + err);
        process.exit(1);
    });
}

run();
