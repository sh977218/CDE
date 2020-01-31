import { formDraftModel } from 'server/form/mongo-form';

process.on('unhandledRejection', error => {
    console.log(error);
});

function run() {
    let formCount = 0;
    const cond = {};
    const cursor = formDraftModel.find(cond).cursor();
    cursor.eachAsync(async (form: any) => {
        const formObj = form.toObject();
        await form.save().catch(error => {
            console.log(formObj._id);
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
