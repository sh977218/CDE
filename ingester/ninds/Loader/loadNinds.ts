import { NindsModel } from 'ingester/createMigrationConnection';

async function doOneCdeByCdeId(cdeId) {
    const nindsForms = await NindsModel.find({'cde.CDE ID': 'C17409'});

}

NindsModel.distinct('cdes.CDE ID')
    .cursor().eachAsync(async cdeId => {
    await doOneCdeByCdeId(cdeId);
}).then(res => {
}, err => {
});
