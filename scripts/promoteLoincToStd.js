const mongo_cde = require("../server/cde/mongo-cde");

async function run() {

    let query = {
        archived: false,
        'sources.sourceName': {$in: ['LOINC', 'Assessment Center']},
        'ids.source': 'LOINC',
        'registrationState.registrationStatus': {$ne: 'Retired'},
        'lastMigrationScript': {$ne: 'promoteLoincToStd'}
    };
    let total = await mongo_cde.DataElement.countDocuments(query);
    let done = 0;

    console.log("need to do: " + total);

    mongo_cde.DataElement.find(query).cursor({batchSize: 20}).eachAsync(async oneCde => {
        oneCde.registrationState.registrationStatus = "Standard";
        oneCde.changeNote = "Updated LOINC CDEs to Standard Status";
        oneCde.lastMigrationScript = "promoteLoincToStd";

        await mongo_cde.updatePromise(oneCde, {username: 'batchloader'});

        // console.log("Did: " + oneCde.tinyId);
        done++;
        if (done % 10 === 0) {
            console.log(done + " / " + total);
        }

    });

}

run().then(() => {}, err => console.log(err));

