import { NindsModel } from 'ingester/createMigrationConnection';
import { createNindsCde } from 'ingester/ninds/website/cde/cde';
import { createNindsForm } from 'ingester/ninds/website/form/form';
import { loadNindsCde, loadNindsForm } from 'ingester/ninds/shared';

async function loadNindsCdes() {
    const cdeIds = await NindsModel.distinct('cdes.CDE ID');
    for (const cdeId of cdeIds) {
        const nindsForms = await NindsModel.find({'cdes.CDE ID': cdeId},
            {
                _id: 0,
                diseaseName: 1,
                subDiseaseName: 1,
                domainName: 1,
                subDomainName: 1,
                cdes: {$elemMatch: {'CDE ID': cdeId}}
            }).lean();
        const cde = await createNindsCde(nindsForms);
        const cond = {
            archived: false,
            'ids.id': cdeId
        };
        await loadNindsCde(cde, cond,  'NINDS');
    }
}

async function loadNindsForms() {
    const formIds = await NindsModel.distinct('formId');
    for (const formId of formIds) {
        const nindsForms = await NindsModel.find({formId}).lean();
        const nindsForm = await createNindsForm(nindsForms);
        const cond = {
            archived: false,
            'ids.id': formId
        };
        await loadNindsForm(nindsForm, cond, 'NINDS');
    }
}


async function run() {
    await loadNindsCdes();
    await loadNindsForms();
}

run().then(
    result => {
        console.log(result);
        console.log('Finished all ninds.');
        process.exit(0);
    },
    err => {
        console.log(err);
        process.exit(1);
    }
);
