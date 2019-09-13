import { LoincModel } from 'ingester/createMigrationConnection';
import { loadLoincById } from 'ingester/loinc/website/newSite/loincLoader';

//const loincId = '62863-6';
//const loincId = '66178-5'; // Normative Answer List
const loincId = '62403-1'; // Part Description | Example Answer List

async function run() {
    await LoincModel.remove({'LOINC Code': loincId});
    console.log('Removed Migration LOINC collection');
    console.log(`Starting fetching LOINC ${loincId}`);
    const loinc = await loadLoincById(loincId);
    console.log(`Finished fetching LOINC ${loincId}`);
    await new LoincModel(loinc).save().catch(e => {
        throw new Error('new LoincModel(loinc).save() Error: ' + e);
    });
    console.log(`Finished saving LOINC ${loincId}`);
}

run().then(() => process.exit(0), err => {
    console.log(err);
    process.exit(1);
});
