import { formModel } from 'server/form/mongo-form';

process.on('unhandledRejection', error => {
    console.log(error);
});

function run() {
    let formCount = 0;
    const cond = {lastMigrationScript: {$ne: 'mongoose validation verify'}};
    const cursor = formModel.find(cond).cursor();
    cursor.eachAsync(async (form: any) => {
        await form.save().catch(error => {
            console.log(`await form.save() Error ${form._id.toString()} ${error}`);
        });
        formCount++;
    }).then(() => {
        console.log('finished.');
        process.exit(0);
    }, e => {
        console.log(e);
        process.exit(1);
    });
}

run();
