var MigrationNewBornScreeningCDEModel = require('./../createMigrationConnection').MigrationNewbornScreeningCDEModel;
var MigrationLoincModel = require('.././createMigrationConnection').MigrationLoincModel;

var LoadFromLoincSite = require('../loinc/Website/LOINCLoader');

MigrationNewBornScreeningCDEModel.find({LONG_COMMON_NAME: {$regex: '^((?!(panel)).)*$'}})
    .sort({'LOINC_NUM': 1}).exec(function (err, dataArray) {
    if (err) throw err;
    var newArray = [];
    dataArray.forEach(function (data) {
        data = data.toObject();
        newArray.push(data.LOINC_NUM.trim());
    });
    LoadFromLoincSite.runArray(newArray, function (one) {
        var obj = new MigrationLoincModel(one);
        obj.save(function (err) {
            if (err) throw err;
        })
    }, function () {
    });

});
