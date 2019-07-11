import { DataElement } from '../server/cde/mongo-cde';

process.on('unhandledRejection', function (error) {
    console.log(error);
});

(function () {
    let cdeCount = 0;
    DataElement.find({
        archived: false
    }).cursor().eachAsync(async (cde: any) => {
        await cde.save().catch(e => {
            throw `${cde.tinyId} ${e}`;
        });
        cdeCount++;
        console.log(`cdeCount: ${cdeCount}`);
    }).then(e => {
        if (e) throw e;
        else {
            console.log('finished.');
            process.exit(0);
        }

    })
})();