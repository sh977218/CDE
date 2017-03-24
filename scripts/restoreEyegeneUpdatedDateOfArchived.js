var async = require('async');
var mongo_cde = require('../modules/cde/node-js/mongo-cde');
var DataElementModel = mongo_cde.DataElement;
var MigrationDateElementModel = require('../ingester/createMigrationConnection').MigrationDataElementModel;

var count = 0;

var stream = DataElementModel.find({archived: false, 'classification.stewardOrg.name': 'NEI'}).stream();
stream.on('data', function (data) {
    stream.pause();
    async.forEach(data.history, function (h, doneOneH) {
        MigrationDateElementModel.findOne({_id: h}).exec(function (err, previousOne) {
            if (err) throw err;
            else {
                DataElementModel.findOne({_id: h}).exec(function (e, currentOne) {
                    if (e) throw e;
                    else {
                        currentOne.updated = previousOne.updated;
                        currentOne.save(function () {
                            count++;
                            console.log('_id: ' + currentOne._id);
                            console.log('count: ' + count);
                            doneOneH();
                        })
                    }
                })
            }
        })
    }, function doneAllH() {
        stream.resume();
    })
});
stream.on('err', function (err) {
    if (err) throw err;
});
stream.on('close', function () {
    console.log('finished. count: ' + count);
    process.exit(1);
});