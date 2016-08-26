var MigrationNewBornScreeningCDEModel = require('./../createMigrationConnection').MigrationNewBornScreeningCDEModel;
var MigrationLoincModel = require('.././createMigrationConnection').MigrationLoincModel;
var LoadFromLoincSite = require('../loinc/LoadFromLoincSite');
var LoadLOINC = require('../loinc/LoadLOINC');

MigrationNewBornScreeningCDEModel.find({LONG_COMMON_NAME: {$regex: 'panel'}}).exec(function (err, dataArray) {
    if (err) throw err;
    var newArray = [];
    dataArray.forEach(function (data) {
        data = data.toObject();
        newArray.push(data.LOINC_NUM.trim());
    });
    // newArray = ['54089-8'];
//    newArray = ['74495-3'];
    LoadFromLoincSite.runArray(newArray, 'Comprehensive', function (one, next) {
//    LoadLOINC.runArray(newArray, function (one, next) {
        var obj = new MigrationLoincModel(one);
        obj.save(function (err) {
            if (err) throw err;
            next();
        });
    }, function (results) {
        process.exit(1);
    });

});
