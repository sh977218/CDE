import { dataElementModel, dataElementSourceModel } from 'server/cde/mongo-cde';
import { formModel, formSourceModel } from 'server/form/mongo-form';
import { fixSources } from 'ingester/shared/utility';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

async function doOneCollection(model) {
    const cond = {
        $or: [
            {source: 'NINDS Preclinical NEI'},
            {'sources.sourceName': 'NINDS Preclinical NEI'}
        ]
    };
    const cursor = model.find(cond).cursor();
    let count = 0;
    return cursor.eachAsync(async model => {
        const modelObj = model.toObject();
        if (modelObj.source === 'NINDS Preclinical NEI') {
            model.source = 'NINDS Preclinical TBI';
        }
        model.sources = fixSources(modelObj);
        await model.save().catch(error => {
            console.log(`await model.save() Error ${error}`);
        });
        count++;
        console.log(modelObj.elementType + ' count: ' + count);
    });
}

function run() {
    const tasks = [dataElementModel, dataElementSourceModel, formModel, formSourceModel]
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
