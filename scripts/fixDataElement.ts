import 'server/globals';
import { Model } from 'mongoose';
import { DataElement, dataElementModel } from 'server/mongo/mongoose/dataElement.mongoose';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

async function doOneCollection(collection: Model<DataElement>) {
    const cond = {};
    const cursor = collection.find(cond).cursor();
    return cursor.eachAsync(async model => {
        await model.save().catch(e => {
            console.log(`${model.tinyId} has error. ${e}`)
        });
        return;
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
