import { Form } from 'server/form/mongo-form';
import { fixFormError } from './utility';

process.on('unhandledRejection', function (error) {
    console.log(error);
});

function run() {
    let formCount = 0;
    let cursor = Form.find({lastMigrationScript: {$ne: 'fixForm'}}).cursor();

    cursor.eachAsync(async (form: any) => {
        form.lastMigrationScript = 'fixForm';
        await fixFormError(form);
        await form.save().catch(error => {
            throw `await form.save() Error on ${form.tinyId} ${error}`;
        });
        formCount++;
        console.log(`formCount: ${formCount}`);
    });
    cursor.on('error', e => {
        console.log(e);
        process.exit(1);
    });
    cursor.on('close', () => {
        console.log('finished.');
        process.exit(0);
    });
}

run();