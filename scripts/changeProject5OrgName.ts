import 'server/globals';
import { DataElementDocument, dataElementModel } from 'server/mongo/mongoose/dataElement.mongoose';
import { organizationModel } from 'server/orgManagement/orgDb';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

const originalName = 'Project 5';
const updatedName = 'Project 5 (COVID-19)';


async function run(){
    const cond = {
        'stewardOrg.name': originalName,
        'registrationState.registrationStatus': {$ne: 'Retired'},
        archived: false
    };

    await organizationModel.findOneAndUpdate({name: originalName}, {$set: {name: updatedName}});

    const cursor = await dataElementModel.find(cond).cursor();
    return cursor.eachAsync(async (model: DataElementDocument) => {
        if(model.stewardOrg.name === originalName){
            model.stewardOrg.name = updatedName;
            model.sources[0].sourceName = updatedName;
            model.classification[0].stewardOrg.name = updatedName;
            model.properties.forEach(p => {
                p.source = updatedName;
                if(p.key === 'Project 5 Source'){
                    p.key = p.key.replace(originalName, updatedName);
                }
            });
        }
        await model.save();
        console.log(`${model.tinyId} updated.`);
    });
}

run().then(() => {
    console.log('done');
    process.exit(0);
}, err => {
    console.log('err ' + err);
    process.exit(1);
});
