import { NindsModel } from 'ingester/createMigrationConnection';
import { createNindsCde } from 'ingester/ninds/website/cde/cde';

function preLoadNindsCdes() {
    return NindsModel.distinct('cdes.CDE ID')
        .cursor().eachAsync(async cdeId => {
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
        });
}

async function run() {
    await preLoadNindsCdes();
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
