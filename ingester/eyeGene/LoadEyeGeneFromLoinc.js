var MigrationEyeGeneLoincModel = require('./../createMigrationConnection').MigrationEyeGeneLoincModel,
    Loinc = require('../loinc/LoadFromLoincSite')
    ;


MigrationEyeGeneLoincModel.find({LONG_COMMON_NAME: {$regex: '^((?!panel).)*$'}}, function (err, dataArray) {
    if (err) throw err;
    var newArray = [];
    dataArray.forEach(function (data) {
        data = data.toObject();
        newArray.push(data.LOINC_NUM.trim());
    });
    Loinc.runArray(newArray, function () {
        process.exit();
    });
});
