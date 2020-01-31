import { formDraftModel } from 'server/form/mongo-form';
import { fixFormError } from 'ingester/shared/form';
import { forEach } from 'async';

process.on('unhandledRejection', error => {
    console.log(error);
});

function run() {
    let formCount = 0;
    const idsToFix = ['5799137d8a02bdb90feddd4c', '57dae520bc6f0dfc3225423a', '57dae56a38d8ec8c34efe011', '57fe5e058f0f52e0629a1c59', '5922f8950aa6851644c56021', '5949644104839b2c1c4ed3fb', '5949649404839b2c1c4ed51b', '5a27085ba55fda09442f74cf', '5a2eb7d07dddd8097d65c028', '5a539a4adfbb51098cf1d5e0', '5a68fc922183ec0981ea50e2', '5a6905872183ec0981ea598a', '5a6a46b92183ec0981eb7998', '5b55e38ec32e34096cd0f273', '5be494c1567d3a14e0128712'];
    console.log(`idsToFix.length: ${idsToFix.length}`);
    forEach(idsToFix, (idToFix, doneOne) => {
        formDraftModel.findById(idToFix, async (err, form) => {
            if (err) {
                throw err;
            } else {
                form.lastMigrationScript = 'mongoose validation';
                await fixFormError(form);
                await form.save().catch(error => {
                    console.log(`await form.save() ${idToFix} Error ${error}`);
                });
                formCount++;
                console.log(`formCount: ${formCount}`);
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
