import { isEmpty } from 'lodash';
import { LoincModel } from 'ingester/createMigrationConnection';
import { runOneCde } from 'ingester/loinc/LOADER/loincCdeLoader';
import { runOneForm } from 'ingester/loinc/LOADER/loincFormLoader';


const loincId = '56091-2';

async function run() {
    const loinc: any = await LoincModel.findOne({'LOINC Code': loincId}).lean();
    if (!isEmpty(loinc['Panel Hierarchy'])) {
        await runOneForm(loinc, 'LOINC', []);
    } else {
        await runOneCde(loinc, 'LOINC', []);
    }
}

run().then();
