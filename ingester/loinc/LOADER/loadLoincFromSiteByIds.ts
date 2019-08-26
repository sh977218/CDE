import { MigrationLoincModel } from 'ingester/createMigrationConnection';
import { runOneLoinc } from 'ingester/loinc/Website/loincLoader';

const loincId = '62400-7';

async function run() {
    await MigrationLoincModel.remove({loincId: '62399-1'}).catch(e => {
        throw "Error MigrationLoincModel.remove(:" + e;
    });
    console.info('Migration loinc collection removed.');
    let loinc = await runOneLoinc(loincId).catch(e => {
        throw "Error await loincLoader.runOneLoinc(loincId):" + e;
    });
    new MigrationLoincModel(loinc).save().catch(e => {
        throw "Error new MigrationLoincModel(loinc).save():" + e;
    });
}

run().then(() => {
}, err => console.log(err));