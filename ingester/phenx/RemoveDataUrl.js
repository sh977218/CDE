var async = require('async');
var DataElementModel = require('../../modules/cde/node-js/mongo-cde').DataElement;

var batchUser = {username: 'batchLoader'};
var today = new Date().toJSON();
var changeNote = 'Bulk update from source';

var modifiedCDE = 0;
var sameCDE = 0;
var totalCDE = 0;
function run() {
    DataElementModel.find({'stewardOrg.name': 'PhenX', archived: false}).exec(function (err, allDes) {
        async.each(allDes, function (de, cb) {
            totalCDE++;
            var dataSets = de.get('dataSets');
            if (dataSets && dataSets.length === 0) {
                sameCDE++;
                cb();
            }
            else if (dataSets && dataSets.length > 0) {
                var oldArr = dataSets;
                de.dataSets = [];
                oldArr.forEach(function (ds) {
                    var dsObj = ds.toObject();
                    delete dsObj.dataUri;
                    de.dataSets.push(dsObj);
                });
                de.usedBy = batchUser;
                de.changeNote = changeNote;
                de.updated = today;
                de.markModified('dataSets');
                de.save(function (err) {
                    if (err) throw err;
                    modifiedCDE++;
                    cb();
                });
            }
            else {
                console.log('something wrong with this cde.');
                console.log('cde Id: ' + de.get('tinyId'));
                console.log('dataSets.length: ' + dataSets.length);
                process.exit(0);
            }
        }, function () {
            console.log('-----------------------------------------');
            console.log('total CDE: ' + totalCDE);
            console.log('modified CDE: ' + modifiedCDE);
            console.log('same CDE: ' + sameCDE);
            //noinspection JSUnresolvedVariable
            process.exit(0);
        });
    });
}
run();