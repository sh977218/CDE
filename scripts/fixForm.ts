import { Form } from 'server/form/mongo-form';

process.on('unhandledRejection', error => {
    console.log(error);
});

function run() {
    let formCount: number = 0;
    const cond = {archived: false};
    const cursor = Form.find(cond).cursor();

    cursor.eachAsync(async (form: any) => {
        form.lastMigrationScript = 'fixForm';
//        await fixFormError(form);
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
