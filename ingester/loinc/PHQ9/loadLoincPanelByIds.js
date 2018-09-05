const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const LoadFromLoincSite = require('./../Website/LOINCLoader');

const newArray = ['70837-0', '62672-1', '62648-1', '62655-6'];
const orgName = 'PhenX';
LoadFromLoincSite.runArray(newArray, orgName, (one, next) => {
    new MigrationLoincModel(one).save(err => {
        if (err) throw err;
        next();
    })
}, function () {
    process.exit(0);
});
