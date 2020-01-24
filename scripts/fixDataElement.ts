import { dataElementModel } from 'server/cde/mongo-cde';
import { fixCdeError } from 'ingester/shared/de';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

function run() {
    let cdeCount = 0;
    const cond = {lastMigrationScript: {$ne: 'mongoose validation'}};
    const cursor = dataElementModel.find(cond).cursor();
    cursor.eachAsync(async (cde: any) => {
        await fixCdeError(cde);
        cde.lastMigrationScript = 'mongoose validation';
        await cde.save().catch(error => {
            console.log(`await cde.save() Error ${error}`);
        });
        cdeCount++;
//        console.log(`cdeCount: ${cdeCount}`);
    }).then(() => {
        console.log('finished.');
        process.exit(0);
    }, e => {
        console.log(e);
        process.exit(1);
    });
}

run();
