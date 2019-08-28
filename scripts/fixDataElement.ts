import { DataElement } from 'server/cde/mongo-cde';
import { fixCdeError } from './utility';

process.on('unhandledRejection', function (error) {
    console.log(error);
});


function run() {
    let cdeCount = 0;
    let cond = {};
    let cursor = DataElement.find(cond).cursor();
    cursor.eachAsync(async (cde: any) => {

        /* @TODO Remove this code after run against test data.
           This fix is to fix form XkSTmyBSYg has xug6J6R8fkf that is version '3',
           but in Data Element xug6J6R8fkf has version thirdVersion
        */
        if (cde.tinyId === 'xug6J6R8fkf') {
            cde.version = '3';
        }

        /* @TODO Remove this code after run against test data.
           This fix is to fix form 71P6HVrUM has question 71P6HVrUM that has id 59052-1, but it's missing in data element.
           for sdc export test.
        */
        if (cde.tinyId === '71P6HVrUM') {
            cde.ids = [{
                "id": "59052-1",
                "source": "LOINC",
                "version": "2.1213"
            }];
        }

        cde.lastMigrationScript = 'fixDataElement';
        fixCdeError(cde);
        await cde.save().catch(error => {
            throw `await cde.save() Error on ${cde.tinyId} ${error}`;
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