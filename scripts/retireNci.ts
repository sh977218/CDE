import 'server/globals';
import { getStream as getDeStream } from 'server/mongo/mongoose/dataElement.mongoose';
import { getStream as getFormStream } from 'server/mongo/mongoose/form.mongoose';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

let deCounter = 0;

let formCounter = 0;

async function doDataElement() {
    const cond = {
        archived: false,
        'classification.stewardOrg.name': 'NCI',
        'registrationState.registrationStatus': {$ne: 'Retired'},
    };
    const cursor = getDeStream(cond);
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

async function doForm() {
    const cond = {
        archived: false,
        'classification.stewardOrg.name': 'NCI',
        'registrationState.registrationStatus': {$ne: 'Retired'},
    };
    const cursor = getFormStream(cond);
    return cursor.eachAsync(async model => {
        model.classification = model.classification.filter(c => c.stewardOrg.name !== 'NCI');
        if (model.classification.length === 0) {
            model.registrationState.registrationStatus = 'Retired';
        }
        await model.save().catch(e => {
            console.log(`${model.tinyId} has error. ${e}`);
            process.exit(1);
        });
        formCounter++;
        return;
    });
}


function run() {
    const tasks = [doDataElement(), doForm()];
    Promise.all(tasks).then(() => {
        console.log('done');
        console.log(`deCounter: ${deCounter}`)
        console.log(`formCounter: ${formCounter}`)
        process.exit(0);
    }, err => {
        console.log('err ' + err);
        process.exit(1);
    });
}

run();
