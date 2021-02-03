import { Model } from 'mongoose';
import { CdeFormDocument, formModel, formSourceModel } from 'server/form/mongo-form';
import { formRawArtifact } from 'ingester/shared/utility';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

async function doOneCollection(collection: Model<CdeFormDocument>) {
    const cond = {
        'registrationState.registrationStatus': {$ne: 'Retired'},
        archived: false,
        'classification.stewardOrg.name': 'NHLBI',
        'classification.0': {$exists: true},
        'ids.source': 'NINDS'
    };
    const cursor = collection.find(cond).cursor();
    return cursor.eachAsync(async model => {
        const modelObj = model.toObject();
        const hasNindsClassif = modelObj.classification.filter((c: any) => c.stewardOrg.name === 'NINDS').length;
        if (!hasNindsClassif) {
            modelObj.ids.forEach((id: any) => {
                if (id.source === 'NINDS') {
                    id.source = 'NHLBI';
                }
            })
            model.ids = modelObj.ids;
            await model.save();
            console.log(`${modelObj.tinyId} fixed.`);
        }

    });
}

function run() {
    const tasks = [formModel, formSourceModel]
        .map(model => doOneCollection(model));
    Promise.all(tasks).then(() => {
        console.log('done');
        process.exit(0);
    }, err => {
        console.log('err ' + err);
        process.exit(1);
    });
}

run();
