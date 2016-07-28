var MigrationNewBornScreeningCDEModel = require('./../createConnection').MigrationNewBornScreeningCDEModel,
    Loinc = require('../loinc/LoadFromLoincSite')
    ;

var removeMigration = false;

MigrationNewBornScreeningCDEModel.find({LONG_COMMON_NAME: {$regex: '^((?!panel).)*$'}}, function (err, dataArray) {
    if (err) throw err;
    var newArray = [];
    dataArray.forEach(function (data) {
        data = data.toObject();
        newArray.push(data.LOINC_NUM.trim());
    });
    Loinc.runArray(newArray, removeMigration, function () {
        process.exit();
    });
});
