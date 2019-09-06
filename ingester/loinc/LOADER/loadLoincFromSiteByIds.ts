import { LoincModel } from 'ingester/createMigrationConnection';
import { runOneLoinc } from 'ingester/loinc/Website/loincLoader';

const loincId = '62399-1';

async function run() {
    await LoincModel.remove({loincId});
    console.log('Removed Migration LOINC collection');
    console.log(`Starting fetching LOINC ${loincId}`);
    let loinc = await runOneLoinc(loincId);
    console.log(`Finished fetching LOINC ${loincId}`);
    await new LoincModel(loinc).save().catch(e => {
        throw 'new LoincModel(loinc).save() Error: ' + e;
    });
    console.log(`Finished saving LOINC ${loincId}`);
}

run().then(() => process.exit(0), err => {
    console.log(err);
    process.exit(1);
});