import { dataElementSourceModel } from 'server/cde/mongo-cde';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

function run() {
    let cdeCount = 0;
    const cond = {};
    const cursor = dataElementSourceModel.find(cond).cursor();
    cursor.eachAsync(async (de: any) => {
        const deObj = de.toObject();
        await de.save().catch(error => {
            console.log(deObj._id);
        });
        cdeCount++;
    }).then(() => {
        console.log('finished.');
        process.exit(0);
    }, e => {
        console.log(e);
        process.exit(1);
    });
}

run();
