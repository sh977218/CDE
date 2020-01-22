import { formModel } from 'server/form/mongo-form';
import { fixFormError } from './utility';

process.on('unhandledRejection', error => {
    console.log(error);
});

function run() {
    let formCount = 0;
    const cond = {};
    const cursor = formModel.find(cond).cursor();
    cursor.eachAsync(async (form: any) => {
        form.lastMigrationScript = 'fixForm';
        await fixFormError(form);
        await form.save().catch(error => {
            throw new Error(`await form.save() Error on ${form.tinyId} ${error}`);
        });
        formCount++;
        console.log(`formCount: ${formCount}`);
    }).then(() => {
        console.log('finished.');
        process.exit(0);
    }, e => {
        console.log(e);
        process.exit(1);
    });
}

run();
