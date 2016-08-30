var MigrationLoincModel = require('.././createMigrationConnection').MigrationLoincModel;

var LoadFromLoincSite = require('../loinc/Website/LOINCLoader');


var newArray = ['74080-3', '74495-3', '74501-8', '74502-6', '74725-3'];

LoadFromLoincSite.runArray(newArray, function (one, next) {
    var obj = new MigrationLoincModel(one);
    obj.save(function (err) {
        if (err) throw err;
        next();
    })
}, function () {
    process.exit(0);
});
