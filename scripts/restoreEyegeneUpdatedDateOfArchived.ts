import { forEach } from 'async';
import { DataElement } from '../server/cde/mongo-cde';
import { MigrationDataElementModel } from '../ingester/createMigrationConnection';

var count = 0;

var stream = DataElement.find({archived: false, 'classification.stewardOrg.name': 'NEI'}).cursor();
stream.on('data', function (data) {
    stream.pause();
    forEach(data.history, function (h, doneOneH) {
        MigrationDataElementModel.findOne({_id: h}).exec(function (err, previousOne: any) {
            if (err) throw err;
            else {
                DataElement.findOne({_id: h}).exec(function (e, currentOne) {
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
