const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const LoadFromLoincSite = require('./../Website/LOINCLoader');

const newArray = ['70837-0'];

const orgName = 'External Forms';
LoadFromLoincSite.runArray(newArray, orgName, (one, next) => {
    new MigrationLoincModel(one).save(err => {
        if (err) throw err;
        next();
    })
}, function () {
    process.exit(0);
});
