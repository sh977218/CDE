import { MigrationLoincModel } from '../../createMigrationConnection';
import { runOneLoinc } from '../Website/loincLoader';

const loincId = '62399-1';

async function run() {
    await MigrationLoincModel.remove({loincId});
    let loinc = await runOneLoinc(loincId);
    new MigrationLoincModel(loinc).save();
}

run().then(() => {
}, err => console.log(err));