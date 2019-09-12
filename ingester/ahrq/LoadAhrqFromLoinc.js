var MigrationLoincModel = require('.././createMigrationConnection').MigrationLoincModel;

var LoadFromLoincSite = require('../loinc/website/LOINCLoader');


var newArray = ['74725-3', '74080-3', '74495-3', '74501-8', '74502-6'];
var orgName = 'AHRQ';
LoadFromLoincSite.runArray(newArray, orgName, function (one, next) {
    var obj = new MigrationLoincModel(one);
    obj.save(function (err) {
        if (err) throw err;
        next();
    })
}, function () {
    process.exit(0);
});
