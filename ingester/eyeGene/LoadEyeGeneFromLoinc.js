var MigrationEyeGeneLoincModel = require('./../createMigrationConnection').MigrationEyeGENELoincModel;
var MigrationLoincModel = require('.././createMigrationConnection').MigrationLoincModel;

var orgName = 'eyeGENE';
MigrationEyeGeneLoincModel.find({}).exec(function (err, dataArray) {
    if (err) throw err;
    var newArray = [];
    dataArray.forEach(function (data) {
        data = data.toObject();
        newArray.push(data.LOINC_NUM.trim());
    });
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