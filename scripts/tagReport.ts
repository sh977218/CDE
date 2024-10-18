import 'server/globals';
import { Model } from 'mongoose';
import { CdeFormDocument, formModel } from 'server/form/mongo-form';
import { dataElementModel } from 'server/cde/mongo-cde';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

async function doOneCollection(collection: Model<CdeFormDocument>) {
    const cond = {
        archived: false,
        'registrationState.registrationStatus': {$nin: ['Retired', 'Incomplete']}
    }
    const allNamingTags = await collection.distinct('designations.tags', cond);
    const namingResult = await Promise.all(allNamingTags.map(async tag => {
            const query = {'designations.tags': tag, ...cond};
            const count = await collection.countDocuments(query);
            return {
                tag,
                count
            }
        })
    )
    const allDefinitionTags = await collection.distinct('definitions.tags', cond);
    const definitionResult = await Promise.all(allDefinitionTags.map(async tag => {
            const query = {'definitions.tags': tag, ...cond};
            const count = await collection.countDocuments(query);
            return {
                tag,
                count
            }
        })
    )
    return {namingResult, definitionResult};
}

function run() {
    const tasks = [dataElementModel, formModel]
        .map((model: any) => doOneCollection(model));
    Promise.all(tasks).then(([a, b]) => {
        console.log('done');
        process.exit(0);
    }, err => {
        console.log('err ' + err);
        process.exit(1);
    });
}

run();
