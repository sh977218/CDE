const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const LoadFromLoincSite = require('./../Website/LOINCLoader');

const newArray = ['89070-7'];
//const loincId = '89070-7';
const loincId = '89079-8';

const orgName = 'External Forms';
LoadFromLoincSite.runOne(loincId).then(loinc => {
    console.log(loinc);
    process.exit(1);
}, err => {
    console.log(err);
    process.exit(1);
});
/*try {
    LoadFromLoincSite.runArray(newArray, orgName, (one, next) => {
        new MigrationLoincModel(one).save(err => {
            if (err) throw err;
            next();
        })
    }, function () {
        process.exit(0);
    }).then(() => {
        process.exit(0);
    });
} catch (e) {
    console.log(e);
}*/
