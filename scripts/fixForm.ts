import { Form } from 'server/form/mongo-form';
import { fixFormError } from './utility';

process.on('unhandledRejection', function (error) {
    console.log(error);
});

function run() {
    let formCount = 0;
    let cond = {tinyId: '7y_PFN4Zr', archived: false};
    let cursor = Form.find(cond).cursor();

    cursor.eachAsync(async (form: any) => {
        form.lastMigrationScript = 'fixForm';
        await fixFormError(form);
        await form.save().catch(error => {
            throw `await form.save() Error on ${form.tinyId} ${error}`;
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