import { formModel, formSourceModel } from 'server/form/mongo-form';
import { fixFormElements } from 'ingester/shared/form';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

async function doOneCollection(model) {
    const cond = {
        tinyId: 'mkugwsfp3ie',
        archived: false
    };
    const cursor = model.find(cond).cursor();
    let count = 0;
    return cursor.eachAsync(async model => {
        const modelObj = model.toObject();
        model.formElements = await fixFormElements(modelObj);
        await model.save().catch(error => {
            console.log(`await model.save() Error ${error}`);
        });
        count++;
        console.log(modelObj.elementType + ' count: ' + count);
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
