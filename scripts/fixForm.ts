import { formModel } from 'server/form/mongo-form';
import { fixFormError } from 'ingester/shared/form';

process.on('unhandledRejection', error => {
    console.log(error);
});

function run() {
    let formCount = 0;
    const cond = {lastMigrationScript: {$ne: 'mongoose validation'}};
    const cursor = formModel.find(cond).cursor();
    cursor.eachAsync(async (form: any) => {
        form.lastMigrationScript = 'mongoose validation';
        await fixFormError(form);
        await form.save().catch(error => {
            console.log(`await form.save() Error ${error}`);
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
