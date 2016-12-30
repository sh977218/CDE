var MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;

var LoadFromLoincSite = require('./../Website/LOINCLoader');

var newArray = ['44249-1'];
var orgName = 'PHQ9';
LoadFromLoincSite.runArray(newArray, orgName, function (one, next) {
    var obj = new MigrationLoincModel(one);
    obj.save(function (err) {
        if (err) throw err;
        next();
    })
}, function () {
    process.exit(0);
});
