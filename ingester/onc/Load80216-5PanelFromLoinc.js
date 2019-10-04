var MigrationEyeGeneLoincModel = require('./../createMigrationConnection').MigrationEyeGENELoincModel;
var MigrationLoincModel = require('.././createMigrationConnection').MigrationLoincModel;

var LoadFromLoincSite = require('../loinc/website/LOINCLoader');
var orgName = 'ONC';
MigrationEyeGeneLoincModel.find({}).exec(function (err, dataArray) {
    if (err) throw err;
    var newArray = ['80216-5'];
    LoadFromLoincSite.runArray(newArray, orgName, function (one, next) {
        var obj = new MigrationLoincModel(one);
        obj.save(function (err) {
            if (err) throw err;
            next();
        })
    }, function () {
        process.exit(0);
    });
});