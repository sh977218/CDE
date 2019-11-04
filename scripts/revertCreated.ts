import { dataElementModel } from 'server/cde/mongo-cde';

let cdeCount = 0;

dataElementModel.find({
    'history.0': {$exists: true}
})
    .cursor()
    .eachAsync(async cde => {
        const historyId = cde.history[0];
        const historyCde = await dataElementModel.findById(historyId);
        if (!historyCde) {
            console.log('a');
            process.exit(1);
        } else {
            cdeCount++;
            const cdeObj: any = cde;
            const historyCdeObj: any = historyCde;
            const isCreatedSame = cdeObj.created.getTime() === historyCdeObj.created.getTime();
            if (!isCreatedSame) {
                cde.created = historyCdeObj.created;
                await cde.save();
                console.log(`${cde._id} created changed. cdeCount: ${cdeCount}`);
            } else {
//                console.log(`${cde._id} created not changed. cdeCount: ${cdeCount}`);
            }
            if (cdeCount % 1000 === 0) {
                console.log(`cdeCount: ${cdeCount}`);
            }
        }
    })
    .then(() => {
            console.log(`Finished. cdeCount: ${cdeCount}`);
        },
        err => {
            console.log(err);
        });
