import { DataElement } from 'server/cde/mongo-cde';

process.on('unhandledRejection', error => {
    console.log(error);
});


function run() {
    let cdeCount: number = 0;
    const cond = {archived: false};
    const cursor = DataElement.find(cond).cursor();
    cursor.eachAsync(async (cde: any) => {
        cde.lastMigrationScript = 'fixDataElement';
//        fixCdeError(cde);
        await cde.save().catch(error => {
            throw new Error(`await cde.save() Error on ${cde.tinyId} ${error}`);
        });
        cdeCount++;
        console.log(`cdeCount: ${cdeCount}`);
    }).then(() => {
        console.log('finished.');
        process.exit(0);
    }, e => {
        console.log(e);
        process.exit(1);
    });
}

run();
