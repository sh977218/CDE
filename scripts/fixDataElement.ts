import { dataElementModel } from 'server/cde/mongo-cde';
import { fixCdeError } from './utility';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

function run() {
    let cdeCount = 0;
    const cond = {lastMigrationScript: {$ne: 'addSourcesNew'}, 'sources.0': {$exists: true}};
    const cursor = dataElementModel.find(cond).cursor();
    cursor.eachAsync(async (cde: any) => {
        cde.lastMigrationScript = 'addSourcesNew';
        const cdeObj = cde.toObject();
        await fixCdeError(cde);
        await cde.save().catch(error => {
            console.log(`await cde.save() Error on tinyId: ${cde.tinyId} id: ${cde._id} ${error}`);
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
