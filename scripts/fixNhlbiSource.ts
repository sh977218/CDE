import { Model } from 'mongoose';
import { CdeForm } from 'shared/form/form.model';
import { CdeFormDocument, formModel, formSourceModel } from 'server/form/mongo-form';

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
    return cursor.eachAsync(async doc => {
        const form: CdeForm = doc.toObject();
        const hasNindsClassif = form.classification.filter((c) => c.stewardOrg.name === 'NINDS').length;
        if (!hasNindsClassif) {
            form.ids.forEach((id: any) => {
                if (id.source === 'NINDS') {
                    id.source = 'NHLBI';
                }
            })
            doc.ids = form.ids;
            await doc.save();
            console.log(`${form.tinyId} fixed.`);
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
