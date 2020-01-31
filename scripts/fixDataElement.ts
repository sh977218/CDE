import { dataElementDraftModel } from 'server/cde/mongo-cde';
import { fixDeError } from 'ingester/shared/de';
import { forEach } from 'async';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

function run() {
    let deCount = 0;
    const idsToFix = ['554ba45b4465ada0dbe27cb4', '562a721f67fe6c401fc940e1', '57dae4fc3b5c29f2320b8187', '57dae5023b5c29f2320b8227', '589894a6784d74fc260a8474', '58989848784d74fc260b5ede', '5a1454e96385ff7c1d3e0bd0', '5a14556b6385ff7c1d3e3bd4', '5a14556b6385ff7c1d3e3bd8', '5a1455886385ff7c1d3e464e', '5a14559f6385ff7c1d3e4e30', '5bacfedf234f6308d83e4a35', '5bfee6fa704a753bc8f17e4d', '5c06b466ddbc13094d164c18', '5c62fdc4e5beff1555457517', '5cf54a9c30c0e41666e71b6c', '5cf6a19c89e2a915aae5316e', '5db0a802a2eb1e0a68273f60'];
    console.log(`idsToFix.length: ${idsToFix.length}`);
    forEach(idsToFix, (idToFix, doneOne) => {
        dataElementDraftModel.findById(idToFix, async (err, de) => {
            if (err) {
                throw err;
            } else {
                const deObj = de.toObject();
                de.lastMigrationScript = 'mongoose validation';
                await fixDeError(de);
                await de.save().catch(error => {
                    console.log(`await de.save() ${idToFix} Error ${error}`);
                });
                deCount++;
                console.log(`deCount: ${deCount}`);
                doneOne();
            }
        });
    }, err => {
        if (err) {
            throw err;
        }
        console.log('finished.');
        process.exit(0);
    });
}

run();
