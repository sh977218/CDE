import { dataElementModel } from 'server/cde/mongo-cde';
import { fixDeError } from 'ingester/shared/de';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

function run() {
    let cdeCount = 0;
    const cond = {lastMigrationScript: {$ne: 'mongoose validation verify'}};
    const cursor = dataElementModel.find(cond).cursor();
    cursor.eachAsync(async (cde: any) => {
        /*
                await fixDeError(cde);
        */
        cde.lastMigrationScript = 'mongoose validation verify';
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
