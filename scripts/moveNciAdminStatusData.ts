import { Model } from 'mongoose';
import { CdeFormDocument, formDraftModel, formModel, formSourceModel } from 'server/form/mongo-form';
import { dataElementDraftModel, dataElementModel, dataElementSourceModel } from 'server/cde/mongo-cde';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

async function doOneCollection(collection: Model<CdeFormDocument>) {
    const cond = {'registrationState.administrativeStatus': {$exists: true}};
    const cursor = collection.find(cond).cursor();
    return cursor.eachAsync(async (model: any) => {
        const modelObj = model.toObject();
        const adminStatus = modelObj.registrationState.administrativeStatus;
        const hasNciSource = modelObj.sources.filter((s: any) => s.sourceName === 'caDSR').length;
        const hasLoincSource = modelObj.sources.filter((s: any) => s.sourceName === 'LOINC').length;
        if (hasLoincSource && hasNciSource) {
            console.log(`${modelObj.tinyId} has 2 sources.`);
            process.exit(1);
        }
        if (hasLoincSource) {
            if (adminStatus) {
                model.sources.forEach((s: any) => {
                    if (s.sourceName === 'LOINC') {
                        s.administrativeStatus = adminStatus
                    }
                })
                model.registrationState.administrativeStatus = '';
            }
        }
        if (hasNciSource) {
            if (adminStatus) {
                model.sources.forEach((s: any) => {
                    if (s.sourceName === 'caDSR') {
                        s.administrativeStatus = adminStatus
                    }
                })
                model.registrationState.administrativeStatus = '';
            }
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
