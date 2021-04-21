import { Model } from 'mongoose';
import { DataElementDocument, dataElementModel } from 'server/cde/mongo-cde';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

async function doOneCollection(collection: Model<DataElementDocument>) {
    const cond = {
        'registrationState.registrationStatus': {$ne: 'Retired'},
        archived: false
    };
    const cursor = collection.find(cond).cursor();
    return cursor.eachAsync(async model => {
        const modelObj = model.toObject();
        for (const id of modelObj.ids) {
            const existingObjects = await collection.find({
                'registrationState.registrationStatus': {$ne: 'Retired'},
                archived: false,
                ids: {
                    $elemMatch: {
                        source: id.source,
                        id: id.id
                    }
                }
            });
            if (existingObjects.length > 1) {
                console.log(`tinyId ${modelObj.tinyId} source: ${id.source} id: ${id.id} has ${existingObjects.length} duplications: ${existingObjects.map(o => o.tinyId).join(', ')}`);
            }
        }

    });
}

function run() {
    const tasks = [dataElementModel]
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
